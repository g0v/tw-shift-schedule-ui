var React = require('react')

class CSVUpload extends React.Component {
  constructor (props) {
    super(props)
    this.state = { loading: false }
  }

  render () {
    return (
      <div className='relative overflow-hidden inline-block'>
        <div className='nav-btn ml-2 h-full bg-green text-white'>
          <span>
            {this.state.loading ? <i className='fas fa-spinner' /> : <i className='fas fa-upload' />}
            &nbsp;
            {this.state.loading ? '載入中' : '批次匯入'}
          </span>
        </div>
        <input type='file' className='text-5xl absolute' style={{ left: 0, top: 0, opacity: 0 }} accept='text/csv' name='file' onChange={this.onChange.bind(this)} />
      </div>
    )
  }

  onChange (e) {
    this.setState({ loading: true })
    console.log(e.target.files[0])

    let reader = new FileReader()
    reader.onload = (e) => {
      this.setState({ loading: false })
      this.props.callback(e.target.result)
    }

    reader.readAsText(e.target.files[0])
  }
}

export default CSVUpload
