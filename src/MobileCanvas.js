
import { Stage, Layer, Rect, Text } from 'react-konva'
import Grid from './MobileGrid'
import { visItems } from './timeutil'

import consts from './const'

const rowHeight = 50
const headerHeight = 20

var React = require('react')

class Canvas extends React.Component {
  render () {
    if (!this.props.shifts || this.props.shifts.length === 0) {
      return (
        <div />
      )
    }

    // items = 加上隱藏工時後的班表
    let items = visItems(this.props.shifts, this.props.settings)
    let { settings } = this.props

    // 顯示班表
    let listItems = items.map((item, index) => {
      let x = Math.floor((item.start.hour() * 60 + item.start.minutes()) / 6) + 60
      let y = getRowOffset(items[0], item)
      return (
        <Rect key={item.start.format()}
          x={x}
          y={y}
          width={item.length / 6}
          height={rowHeight}
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
      let x = Math.floor((item.start.hour() * 60 + item.start.minutes()) / 6) + 60
      let y = getRowOffset(items[0], item)
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
        let x = Math.floor((item.start.hour() * 60 + item.start.minutes()) / 6) + 60 - (settings.hiddenBefore / 6)
        let y = getRowOffset(items[0], item)
        if (!item.split || item.split === 'head') {
          hiddens.push(
            <Rect key={item.start.format() + `${j}`}
              x={x}
              y={y}
              width={settings.hiddenBefore / 6}
              height={rowHeight}
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
              x={x + (settings.hiddenBefore / 6) + item.length / 6}
              y={y}
              width={settings.hiddenAfter / 6}
              height={rowHeight}
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
    let height = rowCount * rowHeight + headerHeight

    setTimeout(() => {
      this.props.onSetHeight(height)
    }, 1)

    return (
      <div style={{width: consts.mobileCanvasDefaultSize}}>
        <Stage width={consts.mobileCanvasDefaultSize} height={height}>
          <Grid shiftItems={items} />
          <Layer>
            {listItems}
            {hiddens}
            {listItemlabels}
          </Layer>
        </Stage>
      </div>
    )
  }
};

function getRowOffset (firstItem, item) {
  return item.start.clone().startOf('day').diff(firstItem.start.clone().startOf('day'), 'day') * rowHeight + headerHeight
}

export default Canvas
