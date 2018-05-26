import { Layer, Text, Line } from 'react-konva'

var React = require('react')

class Grid extends React.Component {
  render () {
    if (!this.props.shiftItems || this.props.shiftItems.length === 0) {
      return (
        <Layer />
      )
    }

    let shifts = this.props.shiftItems

    // 顯示時間軸
    let times = []
    for (let i = 0; i < 24; i++) {
      if (i % 6 !== 0) {
        times.push(
          <Text key={i}
            text={`|`}
            x={i * 30 + 100}
            y={5} />
        )
      } else {
        let label = `${i}`
        let offset = (label.length / 2) * 6
        times.push(
          <Text key={i}
            text={`${i}`}
            x={i * 30 + 100 - offset}
            y={5} />
        )
      }
    }

    let rowCount = (shifts[shifts.length - 1].start.clone().startOf('day').diff(shifts[0].start.clone().startOf('day'), 'day') + 1)

    // 顯示日期軸
    let dates = []
    for (let i = 0; i < rowCount; i++) {
      dates.push(
        <Text key={i}
          text={shifts[0].start.clone().startOf('day').add(i, 'day').format('YYYY-MM-DD')}
          x={10}
          y={i * 50 + 40} />
      )
    }
    // 日期分隔線
    let rowLines = []
    for (let i = 0; i < rowCount; i++) {
      rowLines.push(
        <Line
          key={i}
          points={[0, i * 50 + 70, 820, i * 50 + 70]}
          stroke='#dddddd'
          opacity={0.5}
        />
      )
    }

    return (
      <Layer>
        {times}
        {dates}
        {rowLines}
      </Layer>
    )
  }
};

export default Grid
