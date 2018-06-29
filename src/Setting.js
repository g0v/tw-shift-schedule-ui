import ReactDOM from 'react-dom'

var React = require('react')

class Setting extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      selectedTransform: 'none'
    }
  }

  handleHiddenHourChange (e) {
    let hiddenBefore = ReactDOM.findDOMNode(this.refs.hiddenBefore).value
    let hiddenAfter = ReactDOM.findDOMNode(this.refs.hiddenAfter).value
    this.props.onUpdate({ hiddenBefore: +hiddenBefore, hiddenAfter: +hiddenAfter })
  }

  handleTransformChange (e) {
    this.setState({ selectedTransform: e.target.value })
    this.props.onTransformUpdate({ selectedTransform: e.target.value })
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
          onChange={this.handleHiddenHourChange.bind(this)} />
        <br />
        <span>後（分鐘）：</span>
        <input
          type='number'
          ref='hiddenAfter'
          placeholder='0'
          style={{ width: '60px' }}
          className='border border-grey text-right'
          value={this.props.settings.hiddenAfter}
          onChange={this.handleHiddenHourChange.bind(this)} />
        <h4 className='mt-3'>彈性工時設定</h4>
        <select value={this.state.selectedTransform} onChange={this.handleTransformChange.bind(this)}>
          <option value='none'>非彈性工時</option>
          <option value='two_week'>雙週彈性工時</option>
          <option value='four_week'>四週彈性工時</option>
          <option value='eight_week'>八週彈性工時</option>
        </select>
        {this.renderEligible()}
      </div>
    )
  }

  // https://www.mol.gov.tw/topic/3067/14530/36712/
  renderEligible () {
    if (this.state.selectedTransform === 'four_week') {
      return <div className='mt-2'>
        <h5>適用行業</h5>
        <span>餐飲、銀行、加油站等服務業</span>
        <span><a href='https://www.mol.gov.tw/topic/3067/14530/36712/'>完整列表請按此</a></span>
      </div>
    } else if (this.state.selectedTransform === 'eight_week') {
      return <div className='mt-2'>
        <h5>適用行業</h5>
        <span>製造業、營造業、客運業、批發零售業等</span>
        <span><a href='https://www.mol.gov.tw/topic/3067/14530/36712/'>完整列表請按此</a></span>
      </div>
    }
  }
}

export default Setting
