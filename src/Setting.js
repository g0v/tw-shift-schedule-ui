import ReactDOM from 'react-dom'

var React = require('react')

class Setting extends React.Component {
  handleChange (e) {
    let hiddenBefore = ReactDOM.findDOMNode(this.refs.hiddenBefore).value
    let hiddenAfter = ReactDOM.findDOMNode(this.refs.hiddenAfter).value
    this.props.onUpdate({hiddenBefore: +hiddenBefore, hiddenAfter: +hiddenAfter})
  }

  render () {
    console.log(this.state)
    return (
      <div className='w-100 tc bg-black-10'>
        <h4>設定</h4>
        <span className='dib'>隱藏工時-前（分鐘）：</span>
        <input
          type='number'
          ref='hiddenBefore'
          placeholder='0'
          onKeyUp={this.handleChange.bind(this)}
          className={`dib ba ma1 pa1`} />
        <span className='dib'>隱藏工時-後（分鐘）：</span>
        <input
          type='number'
          ref='hiddenAfter'
          placeholder='0'
          onKeyUp={this.handleChange.bind(this)}
          className={`ba pa1 ma1`} />
      </div>
    )
  }
}

export default Setting
