import moment from 'moment'

export { isAcrossDay, momentFromItem }

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
