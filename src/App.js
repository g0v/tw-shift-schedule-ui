import React, { Component } from 'react'
import base from './rebase'
import Alerts from './alerts'
import moment from 'moment'
import Canvas from './Canvas'
import Setting from './Setting'
import CSVUpload from './CSVUpload'
import Header from './header'
import { momentFromItem } from './timeutil'

import consts from './const'

class App extends Component {
  componentWillMount () {
    this.setState({
      shifts: [],
      publishID: undefined,
      loading: true,
      edit: true,
      settings: { hiddenBefore: 0, hiddenAfter: 0 },
      empty: true,
      checkInTime: undefined,
      canvasWrapSize: 0
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
      this.setState({ edit: false })
      let data = await base.fetch(`published/${publishID}`, { context: this, asArray: true })
      let settings = await base.fetch(`metadata/${publishID}`, { context: this })
      this.setState({
        publishID: publishID,
        shifts: data,
        loading: false,
        empty: false,
        settings
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
    let newLocation = await base.push(`published`, { data: this.state.shifts })
    let publishID = newLocation.key
    await base.post(`metadata/${publishID}`, { data: this.state.settings })
    window.history.pushState({ publish: publishID }, 'published', publishID)
  }

  handleSubmit (e) {
    this.submit()
  }

  handleDelete (i) {
    let newShifts = this.state.shifts
    newShifts.splice(i, 1)
    this.setState({ shifts: newShifts })
  }

  handleSettingUpdate (settings) {
    this.setState({ settings: settings })
  }

  handleCanvasResize (size) {
    if (size !== this.state.canvasWrapSize) {
      this.setState({ canvasWrapSize: size })
    }
  }

  checkIn () {
    if (!this.state.checkInTime) {
      this.setState({
        checkInTime: moment()
      })
    } else {
      let end = moment()
      if (end.diff(this.state.checkInTime, 'minutes') === 0) {
        window.alert('無法紀錄小於一分鐘的工時')
      } else {
        let start = this.state.checkInTime
        this.addItem(start.format('YYYY-MM-DD'), start.format('HH:mm'), end.format('YYYY-MM-DD'), end.format('HH:mm'))
      }
      this.setState({ checkInTime: undefined })
    }
  }

  handleCSVUpload (text) {
    let data = text.split('\n').map(r => r.split(','))
    let newShifts = []
    for (let d of data) {
      let [start, end] = d
      if (!validateImport(start)) {
        window.alert(`格式錯誤：${start}，應為 YYYY-MM-DD HH:mm `)
        break
      }
      if (!validateImport(end)) {
        window.alert(`格式錯誤：${end}，應為 YYYY-MM-DD HH:mm `)
        break
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
      shifts: newShift,
      empty: false
    })
  }

  render () {
    return (
      <div className='bg-soft text-grey-darker font-sans tracking-wide leading-normal pb-8'>
        <Header />
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
            <div className='flex mb-4' ref={this.setCanvasWrapRef} style={{ height: this.state.canvasWrapSize }}>
              <div className='w-3/4 bg-grey h-12' id='canvas-wrap'>
                {this.state.edit ? <button onClick={this.handleSubmit.bind(this)}>儲存並發佈</button> : ''}
                {this.state.loading === true
                  ? <h3> LOADING... </h3>
                  : <div className='center' style={{ width: consts.canvasDefaultSize }}>
                    <Canvas
                      settings={this.state.settings}
                      shifts={this.state.shifts}
                      onDelete={this.handleDelete.bind(this)}
                      onSetHeight={this.handleCanvasResize.bind(this)} />
                  </div>}
              </div>
              <div className='w-1/4 bg-grey-light h-12' >
                <Setting onUpdate={this.handleSettingUpdate.bind(this)} settings={this.state.settings} />
              </div>
            </div>
          </div>
        </div >
      </div >

    )
  }
}

export default App

function validateImport (cell) {
  if (!cell.match(/\d\d\d\d-\d\d-\d\d \d\d:\d\d/)) {
    return false
  }

  return true
}
