import moment from 'moment'

export { isAcrossDay, momentFromItem, visItems }

// 檢查兩個時間是否在同一天（剛好 00:00:00 壓線不算）
// TODO: 這邊只考慮跨一天的狀況
function isAcrossDay (t1, t2) {
  return t1.date() !== t2.date() &&
    !t1.isSame(t1.clone().endOf('day')) &&
    !t2.isSame(t2.clone().startOf('day'))
}

function momentFromItem (item) {
  let start = moment(`${item.startDate} ${item.startTime}:00`, 'YYYY-MM-DD HH:mm:ss')
  let end = moment(`${item.endDate} ${item.endTime}:00`, 'YYYY-MM-DD HH:mm:ss')
  let length = end.diff(start, 'minutes')
  return {
    start, end, length
  }
}

// 將班表切成視覺化用的區段，跨日時切成兩段
function visItems (shifts, settings) {
  if (!shifts || shifts.length === 0) return []
  let items = []
  for (let item of shifts) {
    let m = momentFromItem(item)
    m.type = 'work'

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
