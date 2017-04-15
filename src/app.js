'use strict'
import CLI from 'clui'
import _ from 'underscore'
import configstore from './lib/configstore'
import chalk from 'chalk'
import clear from 'clear'
import * as Prompt from './questions'
import * as Netpie from './lib/netpie'

var Table = require('cli-table')
let Constants = require('./constants/Constants')

let displayLoggingInToNetpieScreen = (...args) => {
  const status = new CLI.Spinner('Authenticating you, please wait...')
  status.start()
  Netpie.login(...args)
  .then(Netpie.getAppList)
  .then((msg) => {
    status.stop()
    status.message('Fetching apps...')
    status.start()
    configstore.set('apps', msg.apps)
    return msg.apps
  })
  .then(Netpie.getAllAppDetail)
  .then((appsDetail) => {
    configstore.set('appkeys', appsDetail)
    return appsDetail
  })
  .then((apps) => {
    status.stop()
    return showLoggedInScreen(apps)
  })
  .catch((ex) => {
    status.stop()
    console.error(ex)
    // displayPromptLoginScreen()
  })
}

let displayPromptLoginScreen = () => {
  Prompt.promptLogin((...args) => {
    displayLoggingInToNetpieScreen(...args)
  })
}

let showLoggedInScreen = (apps) => {
  clear()
  return Prompt.showSelectAppPrompt(_.map(apps, (v, k) => v.appid))
  .then((arg) => {
    if (arg.Actions === Constants.LOGIN_ACTION_CREATE_NEW_APP) {
      console.log(chalk.bold.yellow(`${Constants.LOGIN_ACTION_CREATE_NEW_APP} is not implemented yet.`))
      showLoggedInScreen()
    } else if (arg.Actions === Constants.LOGIN_ACTION_REFRESH_APP) {
      displayLoggingInToNetpieScreen({
        username: configstore.get('credentials.username'),
        password: configstore.get('credentials.password')
      })
    } else {
      console.log('you choose app detail: ', arg.Actions)
      let apps = configstore.get('appkeys')
      let selectedApp = _.findWhere(apps, {appid: arg.Actions})
      let reformed = _.map(selectedApp.key, (appKey, idx) => {
        return _.pick(appKey, 'name', 'key', 'secret', 'keytype', 'online')
      })
      const tableHead = ['Choice', 'Name', 'Key Type', 'App Key', 'App Secret']
      const table = new Table({
        head: tableHead,
        style: {head: ['green']}
      })
      _.each(reformed, (v, k) => {
        table.push([k, v.name, v.keytype, v.key, v.secret])
      })

      console.log(table.toString())

      Prompt.showSelectKeyFromAppPrompt(reformed).then((action) => {
        if (action.Actions === Constants.LOGIN_ACTION_BACK) {
          clear()
          showLoggedInScreen()
        } else {
          const qrcode = require('qrcode-terminal')
          qrcode.generate('cmmc.io')
          showLoggedInScreen()
        }
      })
    }
  })
}

Prompt.showFiglet()
displayPromptLoginScreen()
