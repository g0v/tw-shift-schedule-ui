import shift from 'tw-shift-schedule'

var React = require('react')

class Overwork extends React.Component {
  overwork () {
    if (this.props.shifts.length === 0) return []

    let shifts = []
    for (let item of this.props.shifts) {
      shifts.push([`${item.startDate} ${item.startTime}:00`, `${item.endDate} ${item.endTime}:00`])
    }

    let overwork = shift.overwork.check(shift.Schedule.fromTime(shifts))
    console.log(overwork)
    return overwork
  }

  render () {
    let causes = this.overwork()
    return (
      <div>
        <ul>
          {JSON.stringify(causes)}
        </ul>
      </div>
    )
  }
};

export default Overwork
