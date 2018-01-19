import shift from './tw-shift-schedule'

var React = require('react')

class Overwork extends React.Component {
  overwork () {
    if (this.props.shifts.length === 0) return []

    let shifts = []
    for (let item of this.props.shifts) {
      shifts.push([`${item.startDate} ${item.startTime}:00`, `${item.endDate} ${item.endTime}:00`])
    }

    let overwork = shift.overwork.check(shift.Schedule.fromTime(shifts))
    return overwork
  }

  render () {
    let causes = this.overwork()
    if (causes.length === 0) {
      return <div />
    }
    return (
      <div className='tc w-80 center pa4 bg-dark-red br3 white-90 f4'>
        <h3 className='ma0 f2 mb3'>這是一份過勞班表！</h3>
        <span>{JSON.stringify(causes)}</span>
      </div>
    )
  }
};

export default Overwork
