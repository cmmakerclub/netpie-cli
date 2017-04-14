'use strict'
import CLI from 'clui'
import _ from 'underscore'
import { login, getAppList, getAllAppDetail } from './lib/netpie'
import inquirer from 'inquirer'
import { promptLogin, showFiglet } from './questions'
import configstore from './lib/configstore'
import clear from 'clear'
let Constants = require('./constants/Constants')

let showLoginActionAfterLoggedIn = (processed) => {
  return inquirer.prompt(
    {
      type: 'list',
      name: 'Actions',
      message: 'What do you want to do?',
      choices: [
        ...processed,
        new inquirer.Separator(),
        Constants.LOGIN_ACTION_CREATE_NEW_APP,
        Constants.LOGIN_ACTION_REFRESH_APP
      ]
    }
  )
}

let showLoggedScreen
let doLoginToNetpie = (...args) => {
  const status = new CLI.Spinner('Authenticating you, please wait...')
  status.start()
  login(...args)
  .then(getAppList)
  .then((msg) => {
    status.stop()
    status.message('Fetching apps...')
    status.start()
    configstore.set('apps', msg.apps)
    return msg.apps
  })
  .then(getAllAppDetail)
  .then((appsDetail) => {
    configstore.set('appkeys', appsDetail)
    return appsDetail
  })
  .then((apps) => {
    status.stop()
    showLoggedScreen = () => {
      return showLoginActionAfterLoggedIn(_.map(apps, (v, k) => v.appid))
      .then((arg) => {
        if (arg.Actions === Constants.LOGIN_ACTION_CREATE_NEW_APP) {
          console.log(`${Constants.LOGIN_ACTION_CREATE_NEW_APP} is not implemented yet.`)
          showLoggedScreen()
        } else if (arg.Actions === Constants.LOGIN_ACTION_REFRESH_APP) {
          doLoginToNetpie({
            username: configstore.get('credentials.username'),
            password: configstore.get('credentials.password')
          })
        } else {
          console.log('you choose app detail: ', arg.Actions)
          let apps = configstore.get('appkeys')
          let selectedApp = _.findWhere(apps, {appid: arg.Actions})
          let reformed = _.map(selectedApp.key, (appKey, idx) => {
            let selected = _.pick(appKey, 'name', 'key', 'secret', 'keytype', 'online')
            return selected
          })
          console.log(reformed)
          showLoggedScreen()
        }
      })
    }
    return showLoggedScreen()
  })
  .catch((ex) => {
    status.stop()
    console.error(ex)
    displayPromptLoginScreen()
  })
}

let displayPromptLoginScreen = () => {
  clear()
  showFiglet()
  promptLogin((...args) => {
    doLoginToNetpie(...args)
  })
}

displayPromptLoginScreen()
