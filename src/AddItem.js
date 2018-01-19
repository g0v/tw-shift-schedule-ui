var React = require('react')
var ReactDOM = require('react-dom')
var moment = require('moment')

class AddItem extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      highlightStart: false,
      highlightEnd: false
    }
  }

  handleAdd (e) {
    // this.props.add(ReactDOM.findDOMNode(this.refs.newItem).value)
    // ReactDOM.findDOMNode(this.refs.newItem).value = ''
    let d = {
      startDate: ReactDOM.findDOMNode(this.refs.startDate).value,
      startTime: ReactDOM.findDOMNode(this.refs.startTime).value,
      endDate: ReactDOM.findDOMNode(this.refs.endDate).value,
      endTime: ReactDOM.findDOMNode(this.refs.endTime).value
    }
    let valid = true
    if (d.startDate === '' || d.startTime === '') {
      this.setState({highlightStart: true})
      valid = false
    }
    if (d.endDate === '' || d.endTime === '') {
      this.setState({highlightEnd: true})
      valid = false
    }
    if (!valid) return

    let start = moment(`${d.startDate} ${d.startTime}`)
    let end = moment(`${d.endDate} ${d.endTime}`)
    if (!end.isAfter(start)) {
      this.setState({highlightStart: true})
      return
    }

    ReactDOM.findDOMNode(this.refs.startDate).value = ''
    ReactDOM.findDOMNode(this.refs.startTime).value = ''
    ReactDOM.findDOMNode(this.refs.endDate).value = ''
    ReactDOM.findDOMNode(this.refs.endTime).value = ''

    this.setState({highlightStart: false, highlightEnd: false})
    this.props.onAdd(d)
    ReactDOM.findDOMNode(this.refs.startDate).focus()
  }

  onKeyDown (e) {
    if (e.keyCode === 13) {
      this.handleAdd(e)
    }
  }

  onBlur (e) {
    if (ReactDOM.findDOMNode(this.refs.startDate).value !== '' && ReactDOM.findDOMNode(this.refs.endDate).value === '') {
      ReactDOM.findDOMNode(this.refs.endDate).value = ReactDOM.findDOMNode(this.refs.startDate).value
    }
    if (ReactDOM.findDOMNode(this.refs.startTime).value !== '' && ReactDOM.findDOMNode(this.refs.endTime).value === '') {
      ReactDOM.findDOMNode(this.refs.endTime).value = ReactDOM.findDOMNode(this.refs.startTime).value
    }
  }

  render () {
    console.log(this.state)
    return (
      <div className='w-100 tc'>
        <span className='dib'>新增工作時段：</span>
        <input
          type='date'
          ref='startDate'
          onKeyDown={this.onKeyDown.bind(this)}
          onBlur={this.onBlur.bind(this)}
          className={`dib ba ma1 pa1 ${this.state.highlightStart ? 'b--dark-red' : ''}`} />
        <input
          type='time'
          ref='startTime'
          onKeyDown={this.onKeyDown.bind(this)}
          onBlur={this.onBlur.bind(this)}
          className={`ba pa1 ma1 ${this.state.highlightStart ? 'b--dark-red' : ''}`} />
        <span className='ml1 mr1'>→</span>
        <input
          type='date'
          ref='endDate'
          onKeyDown={this.onKeyDown.bind(this)}
          onBlur={this.onBlur.bind(this)}
          className={`ba pa1 ma1 ${this.state.highlightEnd ? 'b--dark-red' : ''}`} />
        <input
          type='time'
          ref='endTime'
          onKeyDown={this.onKeyDown.bind(this)}
          onBlur={this.onBlur.bind(this)}
          className={`ba pa1 ma1 ${this.state.highlightEnd ? 'b--dark-red' : ''}`} />
        <button onClick={this.handleAdd.bind(this)}>新增</button>
      </div>
    )
  }
}

module.exports = AddItem
