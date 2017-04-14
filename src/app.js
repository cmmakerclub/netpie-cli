'use strict'
import CLI from 'clui'
import _ from 'underscore'
import { login, getAppList, getAllAppDetail } from './lib/netpie'
import inquirer from 'inquirer'
import { promptLogin, showFiglet } from './questions'
import configstore from './lib/configstore'
import chalk from 'chalk'
import clear from 'clear'
var Table = require('cli-table')
let Constants = require('./constants/Constants')

let showSelectAppPrompt = (processed) => {
  return inquirer.prompt(
    {
      type: 'list',
      name: 'Actions',
      message: 'What do you want to do?',
      choices: [
        ...processed,
        new inquirer.Separator(),
        Constants.LOGIN_ACTION_CREATE_NEW_APP,
        Constants.LOGIN_ACTION_REFRESH_APP,
        new inquirer.Separator()
      ]
    }
  )
}

let showSelectKeyFromAppPrompt = (processed) => {
  return inquirer.prompt(
    {
      type: 'rawlist',
      name: 'Actions',
      message: 'Choose key what you want',
      choices: [
        Constants.LOGIN_ACTION_BACK,
        new inquirer.Separator(),
        ...processed
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
      return showSelectAppPrompt(_.map(apps, (v, k) => v.appid))
      .then((arg) => {
        if (arg.Actions === Constants.LOGIN_ACTION_CREATE_NEW_APP) {
          console.log(chalk.bold.yellow(`${Constants.LOGIN_ACTION_CREATE_NEW_APP} is not implemented yet.`))
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
            return _.pick(appKey, 'name', 'key', 'secret', 'keytype', 'online')
          })

          var tableHead = ['Choice', 'Name', 'Key Type', 'App Key', 'App Secret']
          var table = new Table({
            head: tableHead,
            style: {head: ['green']}
          })
          _.each(reformed, (v, k) => {
            table.push([k, v.name, v.keytype, v.key, v.secret])
          })

          console.log(table.toString())

          showSelectKeyFromAppPrompt(reformed).then((action) => {
            if (action.Actions === Constants.LOGIN_ACTION_BACK) {
              clear()
              showLoggedScreen()
            } else {
              var qrcode = require('qrcode-terminal')
              qrcode.generate('cmmc.io')
              showLoggedScreen()
            }
          })
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
