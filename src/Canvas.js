
import moment from 'moment'
import { Stage, Layer, Rect, Text } from 'react-konva'
import Grid from './Canvas/Grid'
// import Segments from './Canvas/Segments'

import { isAcrossDay } from './timeutil'

import consts from './const'

var React = require('react')

class Canvas extends React.Component {
  listItems (raw) {
    let { settings } = this.props
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

      // 如果跨日就切成兩個, 剛好壓線的話不算
      if (isAcrossDay(m.start, m.end)) {
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

  resize () {
    let canvasWrapWidth = document.querySelector('#canvas-wrap').offsetWidth
    let scaleX = canvasWrapWidth / consts.canvasDefaultSize
    if (scaleX !== this.state.scaleX) {
      console.log(canvasWrapWidth, scaleX)
      this.setState({ scaleX: scaleX })
    }
  }

  componentWillMount () {
    this.setState({
      scaleX: 1
    })
  }

  componentDidMount () {
    this.resize()
    console.log('did mount')

    window.addEventListener('resize', this.resize.bind(this))
  }

  render () {
    // items = 加上隱藏工時後的班表
    let items = this.listItems()
    // rawItems = 未加上隱藏工時的班表
    let rawItems = this.listItems(true)
    let { settings } = this.props

    if (!this.props.shifts || this.props.shifts.length === 0) {
      return (
        <div />
      )
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
          fill='#d9f0d9' />
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
          text={Math.floor(item.length / 60) > 0 ? `${Math.floor(item.length / 60)} 時 ${item.length % 60} 分` : `${item.length % 60} 分`}
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
              fill='#fde49e' />
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
              fill='#fde49e' />
          )
          j++
        }
      }
    }

    let rowCount = (items[items.length - 1].start.clone().startOf('day').diff(items[0].start.clone().startOf('day'), 'day') + 1)
    let height = rowCount * 50 + 20

    setTimeout(() => {
      this.props.onSetHeight(height)
    }, 1)

    console.log(this.state)

    return (
      <div>
        <Stage width={consts.canvasDefaultSize} height={height} scaleX={this.state.scaleX}>
          <Grid shiftItems={items} />
          <Layer>
            {listItems}
            {hiddens}
            {listItemlabels}
          </Layer>
        </Stage>
        <div>
          圖例：
          <ul>
            <li>灰色方塊：記載的工時</li>
            <li>粉紅方塊：隱藏工時</li>
            <li>藍色底線：依照勞基法分出來的工作時段（包含中間休息）</li>
            <li>紅色底線：無法合法切出工作時段</li>
          </ul>
        </div>
      </div>
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
