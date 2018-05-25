
import shift from '../tw-shift-schedule'
import { Layer, Line } from 'react-konva'
import { isAcrossDay } from '../timeutil'

var React = require('react')

class Segments extends React.Component {
  segments () {
    if (!this.props.shifts || this.props.shifts.length === 0) return []

    let shifts = []
    for (let item of this.props.shifts) {
      shifts.push([`${item.startDate} ${item.startTime}:00`, `${item.endDate} ${item.endTime}:00`])
    }

    let tokens = shift.tokenizer(shift.Schedule.fromTime(shifts))
    return tokens
  }

  render () {
    if (!this.props.shifts || this.props.shifts.length === 0) {
      return (
        <Layer />
      )
    }

    // items = 加上隱藏工時後的班表
    let items = this.props.shiftItems
    // rawItems = 未加上隱藏工時的班表
    let rawItems = this.props.rawShiftItems
    // tokens = 按照法律切割後的工作週期
    let tokens = this.segments()

    // 顯示依照法律切段的班表
    let segments = []
    let startTime = rawItems[0].start.clone()
    // 如果 未加上隱藏工時 跟 加上隱藏工時候的整體班表起始日不同，代表隱藏工時讓整體班表跨日了，需要調整上班區間的顯示位置
    let rowOffset = (rawItems[0].start.date() !== items[0].start.date() ? 1 : 0)

    // 將跨日的 token 切開，方便顯示
    tokens = cutTokensByDay(rawItems, tokens)
    let segmentStartTime = startTime.clone()
    for (let i = 0; i < tokens.length; i++) {
      let token = tokens[i]

      let row = segmentStartTime.date() - startTime.date() + rowOffset

      let segLineStart = segmentStartTime.diff(segmentStartTime.clone().startOf('day'), 'minutes') / 2 + 100
      if (token.type === 'work') {
        segments.push(
          <Line
            key={`${segmentStartTime.format()}-${i}`}
            points={[segLineStart, row * 50 + 70, segLineStart + token.value.length / 2, row * 50 + 70]}
            stroke='blue'
          />
        )
      }
      if (token.type === 'invalid') {
        segments.push(
          <Line
            key={`${segmentStartTime.format()}-${i}-`}
            points={[segLineStart, row * 50 + 70, segLineStart + token.value.length / 2, row * 50 + 70]}
            stroke='red'
            strokeWidth={5}
          />
        )
      }
      segmentStartTime.add(token.value.length, 'minutes')
    }

    return (
      <Layer>
        {segments}
      </Layer>
    )
  }
};

export default Segments

// tokens works without hidden shift
function cutTokensByDay (rawShiftItems, tokens) {
  let cuttedTokens = []
  let scheduleStartTime = rawShiftItems[0].start.clone()
  let tokenStartTime = scheduleStartTime.clone()
  for (let i = 0; i < tokens.length; i++) {
    let token = tokens[i]
    let tokenEndTime = tokenStartTime.clone().add(token.value.length, 'minutes')

    if (token.type !== 'work' && token.type !== 'rest') {
      // 只切「work」跟「invalid」兩種 token
      cuttedTokens.push(token)
    } else if (!isAcrossDay(tokenStartTime, tokenEndTime)) {
      // 沒有跨日就不切
      cuttedTokens.push(token)
    } else {
      let firstDayLength = tokenStartTime.clone().endOf('day').diff(tokenStartTime, 'minutes') + 1
      // 跨日就切成兩個
      cuttedTokens.push({
        type: token.type,
        value: token.value.slice(0, firstDayLength)
      })
      cuttedTokens.push({
        type: token.type,
        value: token.value.slice(firstDayLength, token.value.length)
      })
    }

    tokenStartTime.add(token.value.length, 'minutes')
  }

  return cuttedTokens
}
