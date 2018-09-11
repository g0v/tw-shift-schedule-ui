import Alert from './alert'

var React = require('react')

const title = {
  'error': '違法',
  'warning': '提示'
}

class Alerts extends React.Component {
  render () {
    return (
      <div className='mb-8 w-64 sm:w-auto'>
        {this.props.errorsAndWarnings.map(c => {
          if (c.type === 'warning') {
            return <Alert key={`${c.offset}-${c.msg}`} title={title[c.type]} text={c.msg} color='green' />
          } else {
            return <Alert key={`${c.offset}-${c.msg}`} title={title[c.type]} text={`${c.msg} (${c.time.format('YYYY-MM-DD HH:mm')})`} color='red' />
          }
        }
        )}
        {this.props.overworkCauses.map(c => <Alert key={c} title='過勞' text={c} color='orange' />)}
      </div>
    )
  }
};

export default Alerts
