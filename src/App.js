import React, { Component } from 'react'
import List from './List'
import AddItem from './AddItem'
import base from './rebase'
import Overwork from './Overwork'
import moment from 'moment'
import Canvas from './Canvas'
import Setting from './Setting'

class App extends Component {
  constructor (props) {
    super(props)
    this.state = {
      shifts: [],
      publishID: undefined,
      loading: true,
      edit: true,
      settings: {hiddenBefore: 0, hiddenAfter: 0}
    }
  }

  async fetch () {
    let path = window.location.pathname.match(/^\/(.+)/)
    let publishID
    if (path) {
      // load from published shifts
      publishID = path[1]
      this.setState({edit: false})
      let data = await base.fetch(`published/${publishID}`, { context: this, asArray: true })
      let settings = await base.fetch(`metadata/${publishID}`, {context: this})
      this.setState({
        publishID: publishID,
        shifts: data,
        loading: false,
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

  handleAddItem (newItem) {
    let newShift = this.state.shifts.concat([newItem])
    // sort by start time
    newShift = newShift.sort((x, y) => { return momentFromItem(x).start - momentFromItem(y).start })
    this.setState({
      shifts: newShift
    })
  }

  async submit () {
    let newLocation = await base.push(`published`, {data: this.state.shifts})
    let publishID = newLocation.key
    await base.post(`metadata/${publishID}`, {data: this.state.settings})
    window.history.pushState({publish: publishID}, 'published', publishID)
  }

  handleSubmit (e) {
    this.submit()
  }

  handleDelete (i) {
    let newShifts = this.state.shifts
    newShifts.splice(i, 1)
    this.setState({shifts: newShifts})
  }

  handleSettingUpdate (settings) {
    this.setState({settings: settings})
  }

  render () {
    return (
      <div className='tc'>
        <h1 className='f-6'>班表小幫手</h1>
        <div className='f2 pa4'>
          合法的班表中可能隱藏了過勞的細節。<br />
          隱藏工時、班表之間的休息或待命...等等，都是班表上難以察覺的陷阱。<br />
          輸入班表，讓機器來檢查是否合法、是否可能過勞吧
          <p className='f4'>
            過勞判定標準： http://www.mqjh.tp.edu.tw/mediafile/1901/news/19/2016-1/22016-1-24-21-27-24-nf1.pdf
          </p>
        </div>
        {this.state.edit ? <AddItem
          onAdd={this.handleAddItem.bind(this)}
          onSubmit={this.handleSubmit.bind(this)}
           /> : ''}
        <Overwork settings={this.state.settings} shifts={this.state.shifts} />
        <Setting onUpdate={this.handleSettingUpdate.bind(this)} settings={this.state.settings} />
        {this.state.edit ? <button onClick={this.handleSubmit.bind(this)}>儲存並發佈</button> : ''}
        {this.state.loading === true
                ? <h3> LOADING... </h3>
                : <div className='center' style={{width: '820px'}}>
                  <Canvas
                    settings={this.state.settings}
                    shifts={this.state.shifts}
                    onDelete={this.handleDelete.bind(this)} />
                  <List
                    settings={this.state.settings}
                    shifts={this.state.shifts}
                    onDelete={this.handleDelete.bind(this)}
                    edit={this.state.edit}
                  />
                </div>}
      </div>
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
