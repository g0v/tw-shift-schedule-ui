var React = require('react')

class Header extends React.Component {
  render () {
    return <div className='print:hidden w-full bg-white border-t-2 border-red'>
      <div className='max-w-2xl m-auto p-3'>
        <div className='flex justify-between w-full'>
          <div>
            <div className='border-r pr-4 border-grey inline-block'>
              <a className='no-underline' href='/'>勞工小幫手</a>
            </div>
            <div className='pl-4 hidden sm:inline-block'>
              <a className='no-underline' href='/new'>記錄工時</a>
            </div>
            <div className='pl-4 hidden sm:inline-block'>
              <a className='no-underline' href='/c/'>產生班表</a>
            </div>
            <div className='pl-4 hidden sm:inline-block'>
              <a className='no-underline' href='https://github.com/g0v/tw-shift-schedule/issues'>追蹤法令</a>
            </div>
          </div>
          <div>
            {this.props.disableLogin ? '' : this.renderUser()}
          </div>
        </div>
      </div>
    </div>
  }

  renderUser () {
    return (this.props.user
      ? <div>
        {this.submitBtn()}
        <div className='pl-4 inline-block cursor-pointer' onClick={this.props.logout}>
          登出
        </div>
      </div>
      : <div className='pl-4 inline-block cursor-pointer' onClick={this.props.login}>
        登入
      </div>)
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
