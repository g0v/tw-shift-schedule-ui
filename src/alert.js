import React, { Component } from 'react'

class Alert extends Component {
  render () {
    let c = this.props.color
    var color = [`bg-${c}-lightest`, `border-${c}-light`, `text-${c}-dark`].join(' ')
    return <div className={`${color} mb-2 border pl-4 pr-8 py-3 rounded relative`} role='alert'>
      <strong className='font-bold'>{this.props.title}</strong>：
      <span className='block sm:inline'>{this.props.text}</span>
    </div>
  }
}

export default Alert
