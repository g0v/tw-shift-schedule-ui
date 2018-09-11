import React, { Component } from 'react'
import base from './rebase'
import moment from 'moment'
import Canvas from './Canvas'
import MobileCanvas from './MobileCanvas'
import Header from './Header'
import { momentFromItem } from './timeutil'
import DateTime from 'react-datetime'
import ReactDOM from 'react-dom'
import shift from 'tw-shift-schedule'
import MetaTags from 'react-meta-tags'

import consts from './const'

class Create extends Component {
  componentWillMount () {
    this.setState({
      shifts: [],
      publishID: undefined, // 發佈出去的 ID，由 firebase 產生
      docID: undefined, // local 建立的暫存 ID
      settings: { hiddenBefore: 0, hiddenAfter: 0, selectedTransform: 'none', title: undefined },
      canvasWrapSize: consts.canvasDefaultSize,
      mobileCanvasWrapSize: consts.mobileCanvasDefaultSize,
      mobileCanvasShown: false,
      user: undefined,
      employeeCount: 1,
      showAddItemModal: false,
      itemStartDate: undefined,
      itemStartTime: undefined,
      itemEndDate: undefined,
      itemEndTime: undefined,
      createdKeys: [],
      createError: []
    })
    this.setCanvasWrapRef = ele => {
      this.canvasWrap = ele
    }
  }

  async submit (data) {
    // this.setState({ submitState: 'submitting' })
    let newLocation = await base.push('published', {
      data
      // data: {
      //   shifts: this.state.shifts,
      //   metadata: this.state.settings,
      //   userId: this.state.user.uid
      // }
    })
    return newLocation.key
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

  toggleMobileCanvas () {
    if (this.state.mobileCanvasShown) {
      this.setState({ mobileCanvasShown: false })
    } else {
      this.setState({ mobileCanvasShown: true })
    }
  }

  addItem (startDate, startTime, endDate, endTime, employeeCount) {
    let newItem = {
      endDate,
      endTime,
      startDate,
      startTime,
      employeeCount,
      label: `${employeeCount} 人`
    }
    let newShift = this.state.shifts.concat([newItem])
    // sort by start time
    newShift = newShift.sort((x, y) => { return momentFromItem(x).start - momentFromItem(y).start })
    this.setState({
      shifts: newShift
    })
  }

  onEditEmployeeCount () {
    let count = +window.prompt('總員工人數') || 1

    this.setState({ employeeCount: count })
  }

  onClickAddItemNav () {
    if (!this.state.showAddItemModal) {
      this.setState({ showAddItemModal: true })
    } else {
      this.setState({ showAddItemModal: false })
    }
  }

  onItemStartChange (e) {
    this.setState({
      itemStartDate: e.format('YYYY-MM-DD'),
      itemStartTime: e.format('HH:mm')
    })
  }

  onItemEndChange (e) {
    this.setState({
      itemEndDate: e.format('YYYY-MM-DD'),
      itemEndTime: e.format('HH:mm')
    })
  }

  onAddItem () {
    this.addItem(
      this.state.itemStartDate,
      this.state.itemStartTime,
      this.state.itemEndDate,
      this.state.itemEndTime,
      +ReactDOM.findDOMNode(this.refs.itemCount).value
    )
    this.setState({ showAddItemModal: false })
  }

  async onCreate () {
    let shifts = this.state.shifts.map(s => {
      return { from: `${s.startDate} ${s.startTime}:00`, to: `${s.endDate} ${s.endTime}:00`, required: s.employeeCount }
    })

    try {
      let keys = []
      let schedules = shift.create(this.state.employeeCount, shifts)

      for (let i = 0; i < schedules.length; i++) {
        let s = schedules[i].map(shift => {
          let [startDate, startTime] = shift[0].split(' ')
          let [endDate, endTime] = shift[1].split(' ')
          startTime = startTime.slice(0, 5)
          endTime = endTime.slice(0, 5)
          return { startDate, startTime, endDate, endTime }
        })

        let newLocation = await base.push('published', {
          data: {
            shifts: s,
            metadata: { hiddenBefore: 0, hiddenAfter: 0 },
            userId: 'create'
          }
        })
        keys.push(newLocation.key)
        console.log(keys)
      }
      this.setState({ createdKeys: keys })

      this.setState({ createdSchedules: schedules })
    } catch (e) {
      this.setState({ createError: [e] })
    }
  }

  renderCreatedLinks () {
    return this.state.createdKeys.map((k, i) => {
      return <div className='bg-green-lightest border-green-light text-green-dark mb-2 border pl-4 pr-8 py-3 rounded relative' role='alert'>
        <a href={`/${k}`}>
          <strong className='font-bold'>提示</strong>：
          <span className='block sm:inline'>排班完成 - {i} 號員工</span>
        </a>
      </div>
    })
  }

  renderCreateError () {
    if (this.state.createError.length === 0) {
      return ''
    }
    let e = this.state.createError[0]
    let errData = JSON.parse(e.toString().match(/Unable to schedule: (.+)/)[1])
    let errMsg = `${errData.from} ~ ${errData.to}。需求人數：${errData.required}`
    return <div className='bg-red-lightest border-red-light text-red-dark mb-2 border pl-4 pr-8 py-3 rounded relative' role='alert'>
      <strong className='font-bold'>錯誤</strong>：
      <span className='block sm:inline'>此時段無法排班 {errMsg}</span>
    </div>
  }

  render () {
    return (
      <div className='bg-soft text-grey-darker font-sans tracking-wide leading-normal pb-8 min-h-screen'>
        <div className='wrapper'>
          <MetaTags>
            <title>幫你排班表</title>
            <meta name='viewport' content='user-scalable = no' />
          </MetaTags>
          <div className='content'> Some Content </div>
        </div>
        <Header
          user={this.state.user}
          submitState={this.state.submitState}
          disableLogin />
        <div className='max-w-2xl m-auto p-3 flex sm:block justify-between flex-col' style={{ minHeight: '85vh' }}>
          <div className='py-8 flex justify-between'>
            <h1 className='f-6 text-black mx-auto sm:mx-0'>班表產生器</h1>
            <div className='hidden sm:flex'>
              <div className='nav-btn ml-2 bg-green text-white' onClick={this.onEditEmployeeCount.bind(this)}>
                <span>
                  <i className='fas fa-user' />&nbsp;排班人數：{this.state.employeeCount}
                </span>
              </div>
              <div className='nav-btn ml-2 bg-blue text-white' onClick={this.onClickAddItemNav.bind(this)}>
                <span>
                  <i className='fas fa-plus' />&nbsp;新增時段
                </span>
              </div>
            </div>
          </div>
          <div className='box p-8 min-h-screen'>
            <div className='mb-8 w-64 sm:w-auto'>
              {this.renderCreatedLinks()}
              {this.renderCreateError()}
            </div>
            {this.renderAddItemModal()}
            {this.renderBody()}
          </div>
          {/* <div className='block sm:hidden mx-auto'>
            <div className='text-center my-6'>
              已記錄 {this.state.shifts.length} 項工時
              <div>{this.state.mobileCanvasShown
                ? <div className='text-center p-1 text-blue underline' onClick={this.toggleMobileCanvas.bind(this)}>隱藏完整記錄</div>
                : <div className='text-center p-1 text-blue underline' onClick={this.toggleMobileCanvas.bind(this)}>顯示完整記錄</div>
              }
              </div>
            </div>
          </div> */}
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

  renderAddItemModal () {
    if (!this.state.showAddItemModal) {
      return ''
    }

    return <div className='flex flex-col mb-4 pb-4 text-center bg-grey-lighter'>
      <div>
        <div className='mb-4 mt-4'>
          <h4>新增工作時段</h4>
        </div>
        <fieldset className='inline mr-4'>
          <label>開始時間</label>
          <DateTime inputProps={{ className: 'datetime-input' }} onChange={this.onItemStartChange.bind(this)} />
        </fieldset>
        <fieldset className='inline mr-4'>
          <label>結束時間</label>
          <DateTime inputProps={{ className: 'datetime-input' }} onChange={this.onItemEndChange.bind(this)} />
        </fieldset>
        <fieldset className='inline'>
          <label>排班人數</label>
          <div>
            <input type='number' ref='itemCount' />
          </div>
        </fieldset>
        <div className='mt-4'>
          <a href='#' onClick={this.onAddItem.bind(this)}>新增</a>
        </div>
      </div>
    </div>
  }

  renderBody () {
    if (this.state.shifts.length === 0) {
      return <div>
        <div className='text-center mb-8'>輸入人數與工作時段，讓班表小幫手幫你排班表吧</div>
      </div>
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
      <div className='w-1/4 h-12 ml-8'>
        <a href='#' className='block mb-4' onClick={this.onCreate.bind(this)}>幫我排班！</a>
      </div>
    </div>
  }
}

export default Create
