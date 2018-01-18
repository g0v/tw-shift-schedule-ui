
import moment from 'moment'
import shift from 'tw-shift-schedule'
import {Stage, Layer, Rect, Text, Line} from 'react-konva'
import Konva from 'konva'

var React = require('react')

class Canvas extends React.Component {
  listItems () {
    if (!this.props.shifts || this.props.shifts.length === 0) return []
    let items = []
    for (let item of this.props.shifts) {
      let m = momentFromItem(item)
      m.type = 'work'

      // 如果跨日就切成兩個
      if (m.start.day() !== m.end.day()) {
        let s1 = m.start.clone()
        let e1 = m.start.clone().endOf('day')
        items.push({
          start: s1,
          end: e1,
          length: e1.diff(s1, 'minutes'),
          type: 'work'
        })
        let s2 = m.end.clone().startOf('day')
        let e2 = m.end.clone()
        items.push({
          start: s2,
          end: e2,
          length: e2.diff(s2, 'minutes'),
          type: 'work'
        })
      } else {
        items.push(m)
      }
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
    if (!this.props.shifts || this.props.shifts.length === 0) {
      return (
        <div />
      )
    }
    let tokens = this.shiftTokens()
    console.log(tokens)

    let segments = []
    for (let t of tokens) {

    }

    let items = this.listItems()
    let listItems = items.map((item, index) => {
      let x = Math.floor((item.start.hour() * 60 + item.start.minutes()) / 2) + 100
      let y = item.start.clone().startOf('day').diff(items[0].start.clone().startOf('day'), 'day') * 50 + 20
      return (
        <Rect key={index}
          x={x}
          y={y}
          width={item.length / 2}
          height={50}
          onMouseEnter={() => {
            document.body.style.cursor = 'pointer'
          }}
          onMouseLeave={() => {
            document.body.style.cursor = 'default'
          }}
          fill='#cccccc' />
      )
    })
    let listItemlabels = items.map((item, index) => {
      let x = Math.floor((item.start.hour() * 60 + item.start.minutes()) / 2) + 100
      let y = item.start.clone().startOf('day').diff(items[0].start.clone().startOf('day'), 'day') * 50 + 20
      return (
        <Text key={index}
          x={x}
          y={y}
          text={`${Math.floor(item.length / 60)} 時 ${items.length % 60} 分`}
          color='black' />
      )
    })

    let grid = []
    for (let i = 0; i < 24; i++) {
      grid.push(
        <Text key={i}
          text={`${i}`}
          x={i * 30 + 100}
          y={5} />
      )
    }

    let rowCount = (items[items.length - 1].start.clone().startOf('day').diff(items[0].start.clone().startOf('day'), 'day') + 1)
    let height = rowCount * 50 + 20

    let dates = []
    for (let i = 0; i < rowCount; i++) {
      dates.push(
        <Text key={i}
          text={items[0].start.clone().startOf('day').add(i, 'day').format('YYYY-MM-DD')}
          x={10}
          y={i * 50 + 40} />
      )
    }
    let rowLines = []
    for (let i = 0; i < rowCount; i++) {
      rowLines.push(
        <Line
          key={i}
          points={[0, i * 50 + 70, 820, i * 50 + 70]}
          stroke='#dddddd'
          />
      )
    }

    return (
      <Stage width={820} height={height}>
        <Layer>
          {grid}
        </Layer>
        <Layer>
          {listItems}
          {listItemlabels}
        </Layer>
        <Layer>
          {dates}
        </Layer>
        <Layer>
          {rowLines}
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
