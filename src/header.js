var React = require('react')

class Header extends React.Component {
  render () {
    return <div className='w-full bg-white border-t-2 border-red'>
      <div className='max-w-2xl m-auto p-3'>
        <div className='flex justify-between w-full'>
          <div>
            <div className='border-r pr-4 border-grey inline-block'>
              勞工小幫手
            </div>
            <div className='pl-4 hidden sm:inline-block'>
                記錄工時
              </div>
            <div className='pl-4 hidden sm:inline-block'>
                產生班表
              </div>
            <div className='pl-4 hidden sm:inline-block'>
                追蹤法令
              </div>
          </div>
          <div>
            { this.props.user
            ? <div>
              {this.submitBtn()}
              <div className='pl-4 inline-block cursor-pointer' onClick={this.props.logout}>
                登出
                </div>
            </div>
            : <div className='pl-4 inline-block cursor-pointer' onClick={this.props.login}>
              登入
            </div>
            }
          </div>
        </div>
      </div>
    </div>
  }

  submitBtn () {
    if (this.props.submitState === 'submitting') {
      return <div className='pl-4 inline-block cursor-pointer text-red'>
        發佈中...
      </div>
    } else if (this.props.submitState === 'done') {
      if (this.props.deletable) {
        return <div className='pl-4 inline-block cursor-pointer text-red' onClick={this.props.unpublish}>
        刪除此記錄
      </div>
      }
      return <div className='pl-4 inline-block text-green' />
    } else {
      return <div className='pl-4 inline-block cursor-pointer text-red' onClick={this.props.submit}>
        發佈
      </div>
    }
  }
}

export default Header
