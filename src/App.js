import React, { Component } from 'react'
import base from './rebase'
import Alerts from './alerts'
import moment from 'moment'
import Canvas from './Canvas'
import Setting from './Setting'
import CSVUpload from './CSVUpload'
import Header from './Header'
import { momentFromItem } from './timeutil'
import firebase from 'firebase'

import consts from './const'

class App extends Component {
  componentWillMount () {
    let checkInTime = window.localStorage.getItem('checkInTime')
    if (checkInTime) checkInTime = moment(checkInTime)
    this.setState({
      shifts: [],
      publishID: undefined,
      loading: true,
      settings: { hiddenBefore: 0, hiddenAfter: 0, selectedTransform: 'none' },
      checkInTime: checkInTime,
      canvasWrapSize: 0,
      user: undefined
    })
    this.setCanvasWrapRef = ele => {
      this.canvasWrap = ele
    }
  }

  async fetch () {
    let path = window.location.pathname.match(/^\/(.+)/)
    let publishID
    if (path) {
      // load from published shifts
      publishID = path[1]
      let data = await base.fetch(`published/${publishID}`, { context: this })
      console.log(data)
      this.setState({
        publishID: publishID,
        shifts: data.shifts,
        loading: false,
        submitState: 'done',
        publisherID: data.userId,
        settings: data.metadata
      })
    } else {
      this.setState({
        loading: false
      })
    }
  }

  componentDidMount () {
    this.fetch()
  }

  async submit () {
    this.setState({submitState: 'submitting'})
    let newLocation = await base.push('published', {
      data: {
        shifts: this.state.shifts,
        metadata: this.state.settings,
        userId: this.state.user.uid
      }
    })
    let publishID = newLocation.key
    this.setState({submitState: 'done', publishID: publishID})
    window.history.pushState({ publish: publishID }, 'published', publishID)
  }

  handleSubmit (e) {
    this.submit()
  }

  handleUnpublish (e) {
    this.unpublish()
  }

  async unpublish () {
    await base.remove(`published/${this.state.publishID}`)
    window.location.href = '/'
  }

  handleDelete (i) {
    let newShifts = this.state.shifts
    newShifts.splice(i, 1)
    this.setState({ shifts: newShifts })
  }

  handleHiddenUpdate (settings) {
    this.setState({ settings: Object.assign(this.state.settings, settings) })
  }

  handleTransformUpdate (settings) {
    this.setState({ settings: Object.assign(this.state.settings, settings) })
  }

  handleCanvasResize (size) {
    if (size !== this.state.canvasWrapSize) {
      this.setState({ canvasWrapSize: size })
    }
  }

  handleLogin () {
    var provider = new firebase.auth.FacebookAuthProvider()
    firebase.auth().signInWithPopup(provider).then((result) => {
    // var token = result.credential.accessToken
      var user = result.user
      this.setState({user})
    }).catch((error) => {
      var errorCode = error.code
      var errorMessage = error.message
      var email = error.email
      var credential = error.credential
      console.error(errorCode, errorMessage, email, credential)
    })
  }

  handleLogout () {
    firebase.auth().signOut().then(() => {
      this.setState({user: undefined})
    })
  }

  checkIn () {
    if (!this.state.checkInTime) {
      let checkInTime = moment()
      this.setState({checkInTime})
      window.localStorage.setItem('checkInTime', checkInTime.format())
    } else {
      let end = moment()
      if (end.diff(this.state.checkInTime, 'minutes') === 0) {
        window.alert('無法紀錄小於一分鐘的工時')
      } else {
        let start = this.state.checkInTime
        this.addItem(start.format('YYYY-MM-DD'), start.format('HH:mm'), end.format('YYYY-MM-DD'), end.format('HH:mm'))
        window.localStorage.removeItem('checkInTime')
        this.setState({ checkInTime: undefined })
      }
    }
  }

  handleCSVUpload (text) {
    let data = text.split('\n').map(r => r.split(','))
    let newShifts = []
    for (let d of data) {
      let [start, end] = d
      if (!validateImport(start)) {
        window.alert(`格式錯誤：${start}，應為 YYYY-MM-DD HH:mm `)
        return
      }
      if (!validateImport(end)) {
        window.alert(`格式錯誤：${end}，應為 YYYY-MM-DD HH:mm `)
        return
      }
      let [startDate, startTime] = start.split(' ')
      let [endDate, endTime] = end.split(' ')
      newShifts.push({ startDate, startTime, endDate, endTime })
    }

    if (this.state.shifts.length > 0) {
      if (!window.confirm('將會覆蓋現有資料，確定？')) {
        return
      }
    }

    console.log(newShifts)

    this.setState({ shifts: newShifts })
  }

  addItem (startDate, startTime, endDate, endTime) {
    let newItem = {
      endDate,
      endTime,
      startDate,
      startTime
    }
    let newShift = this.state.shifts.concat([newItem])
    // sort by start time
    newShift = newShift.sort((x, y) => { return momentFromItem(x).start - momentFromItem(y).start })
    this.setState({
      shifts: newShift
    })
  }

  render () {
    let deletable = false
    if (this.state.user) {
      deletable = this.state.user.uid === this.state.publisherID
    }
    return (
      <div className='bg-soft text-grey-darker font-sans tracking-wide leading-normal pb-8'>
        <Header
          login={this.handleLogin.bind(this)}
          user={this.state.user}
          logout={this.handleLogout.bind(this)}
          submit={this.handleSubmit.bind(this)}
          submitState={this.state.submitState}
          unpublish={this.handleUnpublish.bind(this)}
          deletable={deletable} />
        <div className='max-w-2xl m-auto p-3'>
          <div className='py-8 flex justify-between'>
            <h1 className='f-6 text-black'>記錄工時</h1>
            <div className='flex'>
              <div className='nav-btn ml-2 bg-blue text-white' onClick={this.checkIn.bind(this)}>
                <span>
                  <i className='fas fa-clipboard-check' />&nbsp;
                  {this.state.checkInTime ? `已於 ${moment(this.state.checkInTime).format('HH:mm')} 上班，打卡下班` : '打卡上班'}
                </span>
              </div>
              <CSVUpload callback={this.handleCSVUpload.bind(this)} />
            </div>
          </div>
          <div className='box p-8 hidden sm:block min-h-screen'>
            <Alerts settings={this.state.settings} shifts={this.state.shifts} />
            {this.renderBody()}
          </div>
        </div>
        <div className='mt-4 text-center'>
          Powered by g0v
        </div>
      </div>

    )
  }

  renderBody () {
    if (this.state.loading) {
      return <div className='text-center'> 載入中... </div>
    }

    if (this.state.shifts.length === 0) {
      return <div className='text-center'> 還沒有輸入資料喔 </div>
    }
    return <div className='flex mb-4' ref={this.setCanvasWrapRef} style={{ height: this.state.canvasWrapSize }}>
      <div className='w-3/4 h-12 border-r border-grey' id='canvas-wrap'>
        <div className='center' style={{ width: consts.canvasDefaultSize }}>
          <Canvas
            settings={this.state.settings}
            shifts={this.state.shifts}
            onDelete={this.handleDelete.bind(this)}
            onSetHeight={this.handleCanvasResize.bind(this)} />
        </div>
      </div>
      <div className='w-1/4 h-12 ml-8' >
        <Setting
          onHiddenUpdate={this.handleHiddenUpdate.bind(this)}
          onTransformUpdate={this.handleTransformUpdate.bind(this)}
          settings={this.state.settings} />
      </div>
    </div>
  }
}

export default App

function validateImport (cell) {
  if (!cell.match(/\d\d\d\d-\d\d-\d\d \d\d:\d\d/)) {
    return false
  }

  return true
}
