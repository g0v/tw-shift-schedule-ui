
import { Stage, Layer, Rect, Text } from 'react-konva'
import Grid from './Canvas/Grid'
import { visItems } from './timeutil'
// import Segments from './Canvas/Segments'

import consts from './const'

var React = require('react')

class Canvas extends React.Component {
  resize () {
    let canvasWrapWidth = document.querySelector('#canvas-wrap').offsetWidth
    let scaleX = canvasWrapWidth / consts.canvasDefaultSize
    console.log(canvasWrapWidth, scaleX)
    if (scaleX !== this.state.scaleX) {
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

    window.addEventListener('resize', this.resize.bind(this))
  }

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
      let x = Math.floor((item.start.hour() * 60 + item.start.minutes()) / 2) + 100
      let y = getRowOffset(items[0], item)
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
        let x = Math.floor((item.start.hour() * 60 + item.start.minutes()) / 2) + 100 - (settings.hiddenBefore / 2)
        let y = getRowOffset(items[0], item)
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
              x={x + (settings.hiddenBefore / 2) + item.length / 2}
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
      </div>
    )
  }
};

function getRowOffset (firstItem, item) {
  return item.start.clone().startOf('day').diff(firstItem.start.clone().startOf('day'), 'day') * 50 + 20
}

export default Canvas
