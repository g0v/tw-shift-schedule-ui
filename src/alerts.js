import shift from 'tw-shift-schedule'
import Alert from './alert'

var React = require('react')

const title = {
  'error': '違法',
  'warning': '提示'
}

class Alerts extends React.Component {
  render () {
    if (this.props.shifts.length === 0 && !this.props.local) return []

    let shifts = []
    let errorsAndWarnings = []
    let overworkCauses = []
    if (this.props.shifts.length > 0) {
      for (let item of this.props.shifts) {
        shifts.push([`${item.startDate} ${item.startTime}:00`, `${item.endDate} ${item.endTime}:00`])
      }

      let schedule = shift.Schedule.fromTime(shifts)
      overworkCauses = shift.overwork.check(schedule)

      switch (this.props.settings.selectedTransform) {
        case undefined:
          errorsAndWarnings = shift.validate(schedule)
          break
        case 'none':
          errorsAndWarnings = shift.validate(schedule)
          break
        case 'two_week':
          errorsAndWarnings = shift.validate(schedule, { transformed: shift.validate.two_week })
          break
        case 'four_week':
          errorsAndWarnings = shift.validate(schedule, { transformed: shift.validate.four_week })
          break
        case 'eight_week':
          errorsAndWarnings = shift.validate(schedule, { transformed: shift.validate.eight_week })
          break
        default:
          throw new Error(`shouldn't happend`)
      }
    }
    if (this.props.local) {
      errorsAndWarnings.unshift({ type: 'warning', offset: 0, msg: '這份班表暫存在此台電腦上，尚未發佈' })
    }
    return (
      <div className='mb-8 w-64 sm:w-auto'>
        {errorsAndWarnings.map(c => {
          if (c.type === 'warning') {
            return <Alert key={`${c.offset}-${c.msg}`} title={title[c.type]} text={c.msg} color='green' />
          } else {
            return <Alert key={`${c.offset}-${c.msg}`} title={title[c.type]} text={`${c.msg} (${c.time.format('YYYY-MM-DD HH:mm')})`} color='red' />
          }
        }
        )}
        {overworkCauses.map(c => <Alert key={c} title='過勞' text={c} color='orange' />)}
      </div>
    )
  }
};

export default Alerts
