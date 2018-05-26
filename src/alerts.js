import shift from 'tw-shift-schedule'
import Alert from './alert'

var React = require('react')

const title = {
  'error': '違法',
  'warning': '提示'
}

class Alerts extends React.Component {
  render () {
    if (this.props.shifts.length === 0) return []

    let shifts = []
    for (let item of this.props.shifts) {
      shifts.push([`${item.startDate} ${item.startTime}:00`, `${item.endDate} ${item.endTime}:00`])
    }

    let schedule = shift.Schedule.fromTime(shifts)
    let overworkCauses = shift.overwork.check(schedule)

    let errorsAndWarnings = shift.validate(schedule)
    return (
      <div className='tc w-80 center pa4 bg-dark-red br3 white-90 f4'>
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
