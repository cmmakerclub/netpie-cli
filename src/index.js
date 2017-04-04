import CLI from 'clui'
import _ from 'underscore'
import Preferences from 'preferences'
import { showFiglet, getCredentials } from './questions'
import { login } from './netpie'

import inquirer from 'inquirer'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0

const pref = new Preferences('config')

showFiglet()

let prompLogin = (processed) => {
  return inquirer.prompt(
    {
      type: 'list',
      name: 'Actions',
      message: 'What do you want to do?',
      choices: [
        'Create new app',
        new inquirer.Separator(), ...processed
      ]
    }
  )
}

let doLoginPrompt = () => {
  getCredentials((...args) => {
    // args[0].username = 'xnat.wrw@gmail.com'
    // args[0].password = 'UoTR8IG19oh7'
    var status = new CLI.Spinner('Authenticating you, please wait...')
    status.start()
    pref.netpie = {username: args.username, password: args.password}
    login(...args).then((args2) => {
      status.stop()
      let j = JSON.parse(args2)
      let processed = _.map(j, (v, k) => v.appid)
      prompLogin(processed).then(() => {
        console.log('ok')
      })
    })
    .then((...args) => {
      console.log('then ..', ...args)
    })
    .catch(() => {
      status.stop()
      console.log('invalid login')
      doLoginPrompt()
    })
  })
}

doLoginPrompt()
