import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import Create from './Create'

let path = window.location.pathname.match(/^\/(.+)/)
if (path) path = path[1]
console.log(path)

if (path && path.startsWith('c/')) {
  ReactDOM.render(<Create />, document.getElementById('root'))
} else {
  ReactDOM.render(<App />, document.getElementById('root'))
}
