import moment from 'moment'

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

  render () {
    let i = 0

    var listItems = this.listItems().map((item, index) => {
      if (item.type !== 'work') return
      i++

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
      <div className='w-80 pa4'>
        <ul className=''>
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
