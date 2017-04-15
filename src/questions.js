import inquirer from 'inquirer'
import chalk from 'chalk'
import clear from 'clear'
import figlet from 'figlet'
import * as Constants from './constants/Constants'
import _ from 'underscore'
import configStore from './lib/configstore'
import * as Netpie from './lib/netpie'
import CLI from 'clui'

var Table = require('cli-table')
// let Constants = require('./constants/Constants')

function promptLogin () {
  const questions = [
    {
      name: 'username',
      type: 'input',
      default: configStore.get('credentials.username'),
      message: 'Enter your NETPIE username or e-mail address:',
      validate: function (value) {
        if (value.length) {
          configStore.set('credentials.username', value)
          return true
        } else {
          return 'Please enter your username or e-mail address'
        }
      }
    },
    {
      name: 'password',
      type: 'password',
      default: configStore.get('credentials.password'),
      message: 'Enter your password:',
      validate: function (value) {
        if (value.length) {
          configStore.set('credentials.password', value)
          return true
        } else {
          return 'Please enter your password'
        }
      }
    }
  ]
  return inquirer.prompt(questions)
}

let displayLoggingInToNetpieScreen = (...args) => {
  const status = new CLI.Spinner('Authenticating you, please wait...')
  status.start()
  return Netpie.login(...args)
  .then(Netpie.getAppList)
  .then((msg) => {
    status.stop()
    status.message('Fetching apps...')
    status.start()
    configStore.set('apps', msg.apps)
    return msg.apps
  })
  .then(Netpie.getAllAppDetail)
  .then((apps) => {
    status.stop()
    configStore.set('appkeys', apps)
    return showLoggedInScreen()
  })
  .catch((ex) => {
    status.stop()
    console.error(ex)
    console.log('Waiting for login scren..')
    // setTimeout(displayPromptLoginScreen, 1000)
  })
}

let showSelectAppPrompt = () => {
  let apps = configStore.get('appkeys')
  let processed = _.map(apps, (v, k) => v.appid)
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

function showFiglet () {
  clear()
  console.log(
    chalk.magenta(
      figlet.textSync('netpie.js-cli', {horizontalLayout: 'full'})
    )
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

let showLoggedInScreen = () => {
  clear()
  return showSelectAppPrompt()
  .then((arg) => {
    if (arg.Actions === Constants.LOGIN_ACTION_CREATE_NEW_APP) {
      console.log(chalk.bold.yellow(`${Constants.LOGIN_ACTION_CREATE_NEW_APP} is not implemented yet.`))
      showLoggedInScreen()
    } else if (arg.Actions === Constants.LOGIN_ACTION_REFRESH_APP) {
      displayLoggingInToNetpieScreen({
        username: configStore.get('credentials.username'),
        password: configStore.get('credentials.password')
      })
    } else {
      console.log('you choose app detail: ', arg.Actions)
      let apps = configStore.get('appkeys')
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

      showSelectKeyFromAppPrompt(reformed).then((action) => {
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

export { promptLogin, showFiglet, showSelectAppPrompt, showSelectKeyFromAppPrompt, displayLoggingInToNetpieScreen }
