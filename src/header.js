var React = require('react')

class Header extends React.Component {
  render () {
    return <div className='w-full bg-white border-t-2 border-red'>
      <div className='max-w-2xl m-auto p-3'>
        <div className='flex justify-between w-full'>
          <div>
            <div className='border-r pr-4 border-grey inline-block'>
              勞工小幫手首頁
                </div>
            <div className='pl-4 inline-block'>
              記錄工時
                </div>
            <div className='pl-4 inline-block'>
              產生班表
                </div>
            <div className='pl-4 inline-block'>
              追蹤法令
                </div>
            <div className='pl-4 inline-block' />
          </div>
          <div>
            Powered by g0v
              </div>
        </div>
      </div>
    </div>
  }
}

export default Header
