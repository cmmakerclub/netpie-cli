'use strict'
import CLI from 'clui'
import _ from 'underscore'
import Preferences from 'preferences'
import { login } from './lib/netpie'
import inquirer from 'inquirer'
import { promptLogin } from './questions'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0

const pref = new Preferences('config')

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
  promptLogin((...args) => {
    var status = new CLI.Spinner('Authenticating you, please wait...')
    status.start()
    pref.netpie = {username: args.username, password: args.password}
    login(...args).then((appJson) => {
      status.stop()
      let processed = _.map(appJson, (v, k) => v.appid)
      prompLogin(processed).then(() => {
        console.log('ok')
      })
    })
    .then((...args) => {
      console.log('then ..', ...args)
    })
    .catch((ex) => {
      status.stop()
      doLoginPrompt()
      console.log(ex)
    })
  })
}

doLoginPrompt()
