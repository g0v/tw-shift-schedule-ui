import Rebase from 're-base'
import firebase from 'firebase/app'
import 'firebase/database'

var app = firebase.initializeApp({
  apiKey: 'AIzaSyD-uwRYLL8usKVUFa0zHGWQg09zespliIQ',
  authDomain: 'tw-shift-schedule.firebaseapp.com',
  databaseURL: 'https://tw-shift-schedule.firebaseio.com',
  projectId: 'tw-shift-schedule',
  storageBucket: 'tw-shift-schedule.appspot.com',
  messagingSenderId: '684123102541'
})

var db = firebase.database(app)
var base = Rebase.createClass(db)

export default base
