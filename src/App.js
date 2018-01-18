import React, { Component } from 'react'
import './App.css'
import List from './List'
import AddItem from './AddItem'
import base from './rebase'
import Overwork from './Overwork'
import moment from 'moment'
import Canvas from './Canvas'

class App extends Component {
  constructor (props) {
    super(props)
    this.state = {
      shifts: [],
      publishID: undefined,
      loading: true,
      edit: true
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
      console.log(data)
      this.setState({
        publishID: publishID,
        shifts: data,
        loading: false
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
    console.log(base)
    let newLocation = await base.push(`published`, {data: this.state.shifts})
    let publishID = newLocation.key
    console.log(publishID)
    window.history.pushState({publish: publishID}, 'published', publishID)
  }

  handleSubmit (e) {
    this.submit()
  }

  handleDelete (i) {
    console.log('deleting', i)
    let newShifts = this.state.shifts
    newShifts.splice(i, 1)
    console.log('after delete', newShifts)
    this.setState({shifts: newShifts})
  }

  render () {
    return (
      <div className='col-sm-12'>
        <h3 className='text-center'> re-base Todo List </h3>
        {this.state.edit ? <AddItem
          onAdd={this.handleAddItem.bind(this)}
          onSubmit={this.handleSubmit.bind(this)}
           /> : ''}
        {this.state.loading === true
                ? <h3> LOADING... </h3>
                : <div>
                  <Overwork shifts={this.state.shifts} />
                  <Canvas
                    shifts={this.state.shifts}
                    onDelete={this.handleDelete.bind(this)} />
                  <List
                    shifts={this.state.shifts}
                    onDelete={this.handleDelete.bind(this)}
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
