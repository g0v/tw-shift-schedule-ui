import React, { Component } from 'react'
import base from './rebase'
import Alerts from './alerts'
import moment from 'moment'
import Canvas from './Canvas'
import MobileCanvas from './MobileCanvas'
import Setting from './Setting'
import CSVUpload from './CSVUpload'
import Header from './Header'
import { momentFromItem } from './timeutil'
import firebase from 'firebase'
import shift from 'tw-shift-schedule'

import consts from './const'

class App extends Component {
  componentWillMount () {
    let checkInTime = window.localStorage.getItem('checkInTime')
    if (checkInTime) checkInTime = moment(checkInTime)
    this.setState({
      shifts: [],
      publishID: undefined, // 發佈出去的 ID，由 firebase 產生
      docID: undefined, // local 建立的暫存 ID
      loading: true,
      settings: { hiddenBefore: 0, hiddenAfter: 0, selectedTransform: 'none', title: undefined },
      checkInTime: checkInTime,
      canvasWrapSize: consts.canvasDefaultSize,
      mobileCanvasWrapSize: consts.mobileCanvasDefaultSize,
      mobileCanvasShown: false,
      user: undefined
    })
    this.setCanvasWrapRef = ele => {
      this.canvasWrap = ele
    }
  }

  componentDidMount () {
    let path = window.location.pathname.match(/^\/(.+)/)

    if (path) path = path[1]

    if (!path || path === '' || path === 'new') {
      this.init()
    } else {
      let docID = path
      if (JSON.parse(window.localStorage.getItem(`${consts.localstorageKey}-${docID}`))) {
        this.loadFromLocalStorage(docID)
      } else {
        this.loadFromFirebase(docID)
      }
    }
  }

  init () {
    let docID = +(new Date())

    this.setState({
      loading: false,
      docID: docID
    }, () => {
      window.history.pushState(null, '', `/${docID}`)
      this.updatePermission()
    })
  }

  async submit () {
    this.setState({ submitState: 'submitting' })
    let newLocation = await base.push('published', {
      data: {
        shifts: this.state.shifts,
        metadata: this.state.settings,
        userId: this.state.user.uid
      }
    })
    let publishID = newLocation.key
    this.setState({
      submitState: 'done',
      publishID: publishID,
      publisherID: this.state.user.uid
    })
    window.localStorage.removeItem(consts.localstorageKey)
    window.history.pushState({ publish: publishID }, 'published', publishID)
  }

  handleSubmit (e) {
    if (window.confirm(`發佈前請同意使用者條款：

1. 你送出的資料由你所擁有
2. 送出的資料將會公開讓所有人檢閱`)) { this.submit() }
  }

  handleUnpublish (e) {
    this.unpublish()
  }

  async unpublish () {
    await base.remove(`published/${this.state.publishID}`)
    window.localStorage.removeItem(consts.localstorageKey)
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

  handleMobileCanvasResize (size) {
    if (size !== this.state.mobileCanvasWrapSize) {
      this.setState({ mobileCanvasWrapSize: size })
    }
  }

  saveToLocal (docID) {
    if (this.state.submitState === 'done') {
      this.submit()
    } else {
      window.localStorage.setItem(`${consts.localstorageKey}-${docID}`, JSON.stringify(this.state.shifts))
    }
  }

  async loadFromFirebase (docID) {
    let data = await base.fetch(`published/${docID}`, { context: this })
    console.log('load from firebase', data)
    if (!data.shifts) { // firebase 上找不到這個 docID
      return this.init()
    }

    this.setState({
      publishID: docID,
      shifts: data.shifts,
      loading: false,
      submitState: 'done',
      publisherID: data.userId,
      settings: data.metadata
    }, () => {
      this.updatePermission()
    })
  }

  async loadFromLocalStorage (docID) {
    let shifts = JSON.parse(window.localStorage.getItem(`${consts.localstorageKey}-${docID}`))
    console.log('loaded from localStorage', shifts)
    this.setState({
      loading: false,
      docID,
      shifts
    }, () => {
      this.updatePermission()
    })
  }

  toggleMobileCanvas () {
    if (this.state.mobileCanvasShown) {
      this.setState({ mobileCanvasShown: false })
    } else {
      this.setState({ mobileCanvasShown: true })
    }
  }

  handleLogin () {
    var provider = new firebase.auth.FacebookAuthProvider()
    firebase.auth().signInWithPopup(provider).then((result) => {
      // var token = result.credential.accessToken
      var user = result.user
      this.setState({ user }, () => {
        this.updatePermission()
      })
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
      this.setState({ user: undefined })
    })
  }

  checkIn () {
    if (!this.state.checkInTime) {
      let checkInTime = moment()
      this.setState({ checkInTime })
      window.localStorage.setItem('checkInTime', checkInTime.format())
    } else {
      let end = moment()
      if (end.diff(this.state.checkInTime, 'minutes') === 0) {
        window.alert('無法記錄小於一分鐘的工時')
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
      // skip empty line
      if (d.length === 1 && d[0].match(/\s?/)) continue

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

    this.setState({ shifts: newShifts }, () => {
      this.saveToLocal(this.state.docID)
    })
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
    }, () => {
      this.saveToLocal(this.state.docID)
    })
  }

  updatePermission () {
    let deletable = false
    if (this.state.user) {
      deletable = this.state.user.uid === this.state.publisherID
    }
    let writable = false
    if (!this.state.publishID) {
      writable = true
    } else {
      if (this.state.user && this.state.user.uid === this.state.publisherID) {
        writable = true
      }
    }

    this.setState({ deletable, writable })
  }

  validateShifts () {
    let local = !!this.state.docID
    if (this.state.shifts.length === 0 && local) return { errorsAndWarnings: [], overworkCauses: [] }

    let shifts = []
    let errorsAndWarnings = []
    let overworkCauses = []
    if (this.state.shifts.length > 0) {
      for (let item of this.state.shifts) {
        shifts.push([`${item.startDate} ${item.startTime}:00`, `${item.endDate} ${item.endTime}:00`])
      }

      let schedule = shift.Schedule.fromTime(shifts, { format: 'YYYY-MM-DD HH:mm:ss' })
      overworkCauses = shift.overwork.check(schedule)

      switch (this.state.settings.selectedTransform) {
        case undefined:
          errorsAndWarnings = shift.validate(schedule)
          break
        case 'none':
          errorsAndWarnings = shift.validate(schedule)
          break
        case 'two_week':
          errorsAndWarnings = shift.validate(schedule, { transformed: shift.validate.two_week })
          break
        case 'four_week':
          errorsAndWarnings = shift.validate(schedule, { transformed: shift.validate.four_week })
          break
        case 'eight_week':
          errorsAndWarnings = shift.validate(schedule, { transformed: shift.validate.eight_week })
          break
        default:
          throw new Error(`shouldn't happend`)
      }
    }
    if (this.props.local) {
      errorsAndWarnings.unshift({ type: 'warning', offset: 0, msg: '這份班表暫存在此台電腦上，尚未發佈' })
    }

    return { errorsAndWarnings, overworkCauses }
  }

  updateTitle () {
    if (!this.state.writable) return

    let title = window.prompt('新的文件名稱')

    let settings = Object.assign({}, this.state.settings)
    settings.title = title

    this.setState({ settings })
  }

  render () {
    let { errorsAndWarnings, overworkCauses } = this.validateShifts()

    return (
      <div className='bg-soft text-grey-darker font-sans tracking-wide leading-normal pb-8 min-h-screen'>
        <Header
          login={this.handleLogin.bind(this)}
          user={this.state.user}
          logout={this.handleLogout.bind(this)}
          submit={this.handleSubmit.bind(this)}
          submitState={this.state.submitState}
          unpublish={this.handleUnpublish.bind(this)}
          deletable={this.state.deletable} />
        <div className='max-w-2xl m-auto p-3 flex sm:block justify-between flex-col' style={{ minHeight: '85vh' }}>
          <div className='py-8 flex justify-between'>
            <h1 className='hover:bg-white f-6 text-black mx-auto sm:mx-0' onClick={this.updateTitle.bind(this)}>{this.state.settings.title || '未命名文件'}</h1>
            {!this.state.writable ? <div />
              : <div className='hidden sm:flex'>
                <div className='leading-loose pt-2'><a href='https://g0v.hackmd.io/s/SJ6YXCw7Q' target='_blank' rel='noopener noreferrer'>匯入說明<i className='far fa-question-circle' /></a></div>
                <CSVUpload callback={this.handleCSVUpload.bind(this)} />
                <div className='nav-btn ml-2 bg-blue text-white' onClick={this.checkIn.bind(this)}>
                  <span>
                    <i className='fas fa-clipboard-check' />&nbsp;
                    {this.state.checkInTime ? `已於 ${moment(this.state.checkInTime).format('HH:mm')} 上班，打卡下班` : '打卡上班'}
                  </span>
                </div>
              </div>
            }
          </div>
          <div className='box p-8 hidden sm:block min-h-screen'>
            <Alerts errorsAndWarnings={errorsAndWarnings} overworkCauses={overworkCauses} />
            {this.renderBody()}
          </div>
          <div className='block sm:hidden mx-auto'>
            <div className='text-center my-6'>
              已記錄 {this.state.shifts.length} 項工時
              <div>{this.state.mobileCanvasShown
                ? <div className='text-center p-1 text-blue underline' onClick={this.toggleMobileCanvas.bind(this)}>隱藏完整記錄</div>
                : <div className='text-center p-1 text-blue underline' onClick={this.toggleMobileCanvas.bind(this)}>顯示完整記錄</div>
              }
              </div>
            </div>
            <Alerts errorsAndWarnings={errorsAndWarnings} overworkCauses={overworkCauses} />
          </div>
          <div className='sm:hidden mx-auto' id='canvas-wrap'>
            {this.state.mobileCanvasShown
              ? <MobileCanvas
                settings={this.state.settings}
                shifts={this.state.shifts}
                onDelete={this.handleDelete.bind(this)}
                onSetHeight={this.handleMobileCanvasResize.bind(this)} /> : ''
            }
          </div>
          {!this.state.writable ? <div />
            : <div className='block sm:hidden'>
              <div className='nav-btn ml-2 bg-blue text-white py-8 text-xl' onClick={this.checkIn.bind(this)}>
                <span className='block mx-auto'>
                  <i className='fas fa-clipboard-check' />&nbsp;
                  {this.state.checkInTime ? `已於 ${moment(this.state.checkInTime).format('HH:mm')} 上班，打卡下班` : '打卡上班'}
                </span>
              </div>
            </div>
          }
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
        <div className='center' style={{ width: this.state.canvasWrapSize }}>
          <Canvas
            settings={this.state.settings}
            shifts={this.state.shifts}
            onDelete={this.handleDelete.bind(this)}
            onSetHeight={this.handleCanvasResize.bind(this)} />
        </div>
      </div>
      <div className='w-1/4 h-12 ml-8' >
        <Setting
          onUpdate={this.handleHiddenUpdate.bind(this)}
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
