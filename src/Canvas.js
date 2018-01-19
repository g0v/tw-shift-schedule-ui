
import moment from 'moment'
import shift from 'tw-shift-schedule'
import {Stage, Layer, Rect, Text, Line} from 'react-konva'

var React = require('react')

class Canvas extends React.Component {
  listItems (raw) {
    let {settings} = this.props
    if (!this.props.shifts || this.props.shifts.length === 0) return []
    let items = []
    for (let item of this.props.shifts) {
      let m = momentFromItem(item)
      m.type = 'work'
      if (!raw) {
        m.start.subtract(settings.hiddenBefore, 'minutes')
        m.end.add(settings.hiddenAfter, 'minutes')
        m.length += (settings.hiddenBefore + settings.hiddenAfter)
      }

      // 如果跨日就切成兩個
      if (m.start.day() !== m.end.day()) {
        let s1 = m.start.clone()
        let e1 = m.start.clone().endOf('day')
        items.push({
          start: s1,
          end: e1,
          length: e1.diff(s1, 'minutes'),
          type: 'work',
          split: 'head'
        })
        let s2 = m.end.clone().startOf('day')
        let e2 = m.end.clone()
        items.push({
          start: s2,
          end: e2,
          length: e2.diff(s2, 'minutes'),
          type: 'work',
          split: 'tail'
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
    console.log('shift tokens', tokens)
    return tokens
  }

  render () {
    console.log('rendering')
    // items = 加上隱藏工時後的班表
    let items = this.listItems()
    // rawItems = 未加上隱藏工時的班表
    let rawItems = this.listItems(true)
    let {settings} = this.props
    let tokens = this.shiftTokens()

    if (!this.props.shifts || this.props.shifts.length === 0) {
      return (
        <div />
      )
    }

    // 顯示依照法律切段的班表
    let segments = []
    let startTime = rawItems[0].start.clone()
    // 如果 未加上隱藏工時 跟 加上隱藏工時候的班表起始日不同，代表隱藏工時讓班表跨日了，需要調整上班區間的顯示位置
    let rowOffset = (rawItems[0].start.date() !== items[0].start.date() ? 1 : 0)
    let segmentStartTime = startTime.clone()
    for (let i = 0; i < tokens.length; i++) {
      let token = tokens[i]

      let row = segmentStartTime.date() - startTime.date() + rowOffset

      let segLineStart = segmentStartTime.diff(segmentStartTime.clone().startOf('day'), 'minutes') / 2 + 100
      if (token.type === 'work') {
        segments.push(
          <Line
            key={segmentStartTime.format() + `${i}`}
            points={[segLineStart, row * 50 + 70, segLineStart + token.value.length / 2, row * 50 + 70]}
            stroke='blue'
          />
        )
      }
      if (token.type === 'invalid') {
        segments.push(
          <Line
            key={segmentStartTime.format() + `${i}` + '-'}
            points={[segLineStart, row * 50 + 70, segLineStart + token.value.length / 2, row * 50 + 70]}
            stroke='red'
            strokeWidth={5}
          />
        )
      }
      segmentStartTime.add(token.value.length, 'minutes')
    }

    // 顯示班表
    let listItems = items.map((item, index) => {
      let x = Math.floor((item.start.hour() * 60 + item.start.minutes()) / 2) + 100
      let y = item.start.clone().startOf('day').diff(items[0].start.clone().startOf('day'), 'day') * 50 + 20
      return (
        <Rect key={item.start.format()}
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
          fill='#dddddd' />
      )
    })

    // 顯示班的時間長度
    let listItemlabels = items.map((item, index) => {
      let x = Math.floor((item.start.hour() * 60 + item.start.minutes()) / 2) + 100
      let y = item.start.clone().startOf('day').diff(items[0].start.clone().startOf('day'), 'day') * 50 + 20
      return (
        <Text key={item.start.format()}
          x={x}
          y={y}
          text={`${Math.floor(item.length / 60)} 時 ${item.length % 60} 分`}
          color='black' />
      )
    })

    // 顯示隱藏工時
    let hiddens = []
    let j = 0
    if (settings.hiddenBefore > 0 || settings.hiddenAfter > 0) {
      for (let item of items) {
        let x = Math.floor((item.start.hour() * 60 + item.start.minutes()) / 2) + 100
        let y = item.start.clone().startOf('day').diff(items[0].start.clone().startOf('day'), 'day') * 50 + 20
        if (!item.split || item.split === 'head') {
          hiddens.push(
            <Rect key={item.start.format() + `${j}`}
              x={x}
              y={y}
              width={settings.hiddenBefore / 2}
              height={50}
              onMouseEnter={() => {
                document.body.style.cursor = 'pointer'
              }}
              onMouseLeave={() => {
                document.body.style.cursor = 'default'
              }}
              fill='#ffb2bc' />
          )
          j++
        }
        if (!item.split || item.split === 'tail') {
          hiddens.push(
            <Rect key={item.start.format() + `${j}`}
              x={x + item.length / 2 - settings.hiddenAfter / 2}
              y={y}
              width={settings.hiddenAfter / 2}
              height={50}
              onMouseEnter={() => {
                document.body.style.cursor = 'pointer'
              }}
              onMouseLeave={() => {
                document.body.style.cursor = 'default'
              }}
              fill='#ffb2bc' />
          )
          j++
        }
      }
    }

    // 顯示時間座標
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

    // 顯示日期座標
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
          stroke='#eeeeee'
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
          {hiddens}
          {listItemlabels}
        </Layer>
        <Layer>
          {dates}
        </Layer>
        <Layer>
          {rowLines}
          {segments}
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
