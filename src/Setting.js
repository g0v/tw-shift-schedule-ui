import ReactDOM from 'react-dom'

var React = require('react')

class Setting extends React.Component {
  handleChange (e) {
    let hiddenBefore = ReactDOM.findDOMNode(this.refs.hiddenBefore).value
    let hiddenAfter = ReactDOM.findDOMNode(this.refs.hiddenAfter).value
    this.props.onUpdate({ hiddenBefore: +hiddenBefore, hiddenAfter: +hiddenAfter })
  }

  render () {
    return (
      <div className='center br3 w-80 pa3 tc bg-black-10'>
        <h4>隱藏工時設定</h4>
        <span>前（分鐘）：</span>
        <input
          type='number'
          ref='hiddenBefore'
          placeholder='0'
          style={{ width: '60px' }}
          className='border border-grey text-right'
          value={this.props.settings.hiddenBefore}
          onChange={this.handleChange.bind(this)} />
        <br />
        <span>後（分鐘）：</span>
        <input
          type='number'
          ref='hiddenAfter'
          placeholder='0'
          style={{ width: '60px' }}
          className='border border-grey text-right'
          value={this.props.settings.hiddenAfter}
          onChange={this.handleChange.bind(this)} />
      </div>
    )
  }
}

export default Setting
