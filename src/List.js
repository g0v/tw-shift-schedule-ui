import moment from 'moment'
import shift from 'tw-shift-schedule'

var React = require('react')

class List extends React.Component {
  listItems () {
    let items = []
    for (let item of this.props.shifts) {
      let m = momentFromItem(item)
      m.type = 'work'

      if (items.length > 0) {
        let prev = items[items.length - 1]
        items.push({
          type: 'rest',
          start: prev.end,
          end: m.start,
          length: m.start.diff(prev.end) / 1000 / 60
        })
      }

      items.push(m)
    }
    return items
  }

  shiftTokens () {
    if (this.props.shifts.length === 0) return []

    let shifts = []
    for (let item of this.props.shifts) {
      shifts.push([`${item.startDate} ${item.startTime}:00`, `${item.endDate} ${item.endTime}:00`])
    }

    console.log('shifts', shifts)
    let tokens = shift.tokenizer(shift.Schedule.fromTime(shifts))
    return tokens
  }

  render () {
    let i = 0

    var listItems = this.listItems().map((item, index) => {
      if (item.type === 'work') i++

      return (
        <li key={index} className={``}>
          <div>
            <span>{item.type === 'work' ? '👷 工作' : '😴 休息'}</span>
            <span> ({Math.floor(item.length / 60)}h {item.length % 60}m)</span>
          </div>
          <div>
            {item.start.format('YYYY-MM-DD HH:mm')} → {item.end.format('YYYY-MM-DD HH:mm')}
            {this.props.edit && item.type === 'work' ? <a href={`#delete${i}`} onClick={this.props.onDelete.bind(null, i - 1)}> [x] </a> : ''}
          </div>
        </li>
      )
    })

    return (
      <div className='col-sm-12'>
        <ul className='list-group'>
          {listItems}
        </ul>
      </div>
    )
  }
};

export default List

function momentFromItem (item) {
  let start = moment(`${item.startDate} ${item.startTime}:00`)
  let end = moment(`${item.endDate} ${item.endTime}:00`)
  let length = end.diff(start) / 1000 / 60
  return {
    start, end, length
  }
}
