import React, { Component } from 'react'
import List from './List'
import base from './rebase'
import Alerts from './alerts'
import moment from 'moment'
import Canvas from './Canvas'
import Setting from './Setting'

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
      let newItem = {
        endDate: end.format('YYYY-MM-DD'),
        endTime: end.format('HH:mm'),
        startDate: this.state.checkInTime.format('YYYY-MM-DD'),
        startTime: this.state.checkInTime.format('HH:mm')
      }
      let newShift = this.state.shifts.concat([newItem])
      // sort by start time
      newShift = newShift.sort((x, y) => { return momentFromItem(x).start - momentFromItem(y).start })
      this.setState({
        shifts: newShift,
        empty: false
      })
      this.setState({ checkInTime: undefined })
    }
  }

  render () {
    return (
      <div className='bg-soft text-grey-darker font-sans tracking-wide leading-normal pb-8'>
        <div className='w-full bg-white border-t-2 border-red'>
          <div className='max-w-2xl m-auto p-3'>
            <div className='flex justify-between w-full'>
              <div>
                <div className='border-r pr-4 border-grey inline-block'>
                  勞工小幫手首頁
                </div>
                <div className='pl-4 inline-block'>
                  工時檢測
                </div>
                <div className='pl-4 inline-block'>
                  產生班表
                </div>
                <div className='pl-4 inline-block'>
                  函釋追蹤
                </div>
                <div className='pl-4 inline-block' />
              </div>
              <div>
                Powered by g0v
              </div>
            </div>
          </div>
        </div>
        <div className='tc max-w-2xl m-auto p-3'>
          <div className='py-8 flex justify-between'>
            <h1 className='f-6 text-black'>勞工小幫手</h1>
            <div className='flex'>
              <div className='nav-btn' onClick={this.checkIn.bind(this)}>
                <span>
                  <i className='fas fa-cog' />&nbsp;
                  {this.state.checkInTime ? `已於 ${moment(this.state.checkInTime).format('HH:mm')} 上班，打卡下班` : '打卡上班'}
                </span>
              </div>
            </div>
          </div>
          <div className='box p-8 hidden sm:block'>
            <Alerts settings={this.state.settings} shifts={this.state.shifts} />
            <Setting onUpdate={this.handleSettingUpdate.bind(this)} settings={this.state.settings} />
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
                    <List
                      settings={this.state.settings}
                      shifts={this.state.shifts}
                      onDelete={this.handleDelete.bind(this)}
                      edit={this.state.edit}
                    />
                  </div>}
              </div>
              <div className='w-1/4 bg-grey-light h-12' />
            </div>
          </div>
        </div >
      </div >

    )
  }
}

export default App

function momentFromItem (item) {
  let start = moment(`${item.startDate} ${item.startTime}:00`)
  let end = moment(`${item.endDate} ${item.endTime}:00`)
  let length = end.diff(start) / 1000 / 60
  return {
    start, end, length
  }
}
