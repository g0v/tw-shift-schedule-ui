
import moment from 'moment'
import shift from 'tw-shift-schedule'
import {Stage, Layer, Rect, Text} from 'react-konva'
import Konva from 'konva'

var React = require('react')

class Canvas extends React.Component {
  listItems () {
    if (!this.props.shifts || this.props.shifts.length === 0) return []
    let items = []
    for (let item of this.props.shifts) {
      let m = momentFromItem(item)
      m.type = 'work'

      items.push(m)
    }
    return items
  }

  shiftTokens () {
    if (!this.props.shifts || this.props.shifts.length === 0) return []

    let shifts = []
    for (let item of this.props.shifts) {
      shifts.push([`${item.startDate} ${item.startTime}:00`, `${item.endDate} ${item.endTime}:00`])
    }

    console.log('shifts', shifts)
    let tokens = shift.tokenizer(shift.Schedule.fromTime(shifts))
    return tokens
  }

  render () {
    let tokens = this.shiftTokens()
    let colors = ['#aaaaaa', '#333333']

    let items = this.listItems()
    var listItems = items.map((item, index) => {
      console.log('render', item)
      let x = Math.floor((item.start.hour() * 60 + item.start.minutes()) / 2)
      console.log(item.start, items[0].start)
      let y = item.start.startOf('day').diff(items[0].start.startOf('day'), 'day') * 50 + 20
      console.log(index, x, y)
      return (
        <Rect key={index}
          x={x}
          y={y}
          width={item.length / 2}
          height={50}
          fill={colors[index % 2]} />
      )
    })

    let grid = []
    for (let i = 0; i < 24; i++) {
      grid.push(
        <Text key={i}
          text={`${i}`}
          x={i * 30}
          y={5} />
      )
    }

    return (
      <Stage width={720} height={listItems.length * 50 + 20}>
        <Layer>
          {grid}
        </Layer>
        <Layer>
          {listItems}
        </Layer>
      </Stage>
    )
  }
};

export default Canvas

function momentFromItem (item) {
  let start = moment(`${item.startDate} ${item.startTime}:00`)
  let end = moment(`${item.endDate} ${item.endTime}:00`)
  let length = end.diff(start, 'minutes')
  return {
    start, end, length
  }
}
