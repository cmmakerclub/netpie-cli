import inquirer from 'inquirer'
import chalk from 'chalk'
import clear from 'clear'
import figlet from 'figlet'
import * as Constants from './constants/Constants'
import _ from 'underscore'
import configStore from './lib/configstore'
import * as Netpie from './lib/netpie'
import * as Utils from './lib/Utils'
import CLI from 'clui'
import Table from 'cli-table'

function promptLogin () {
  const questions = [
    {
      name: 'username',
      type: 'input',
      default: configStore.get(Constants.CONF_USERNAME),
      message: 'Enter your NETPIE username or e-mail address:',
      validate: function (value) {
        if (value.length) {
          Utils.set(Constants.CONF_USERNAME, value)
          return true
        } else {
          return 'Please enter your username or e-mail address'
        }
      }
    },
    {
      name: 'password',
      type: 'password',
      default: Utils.get(Constants.CONF_PASSWORD),
      message: 'Enter your password:',
      validate: function (value) {
        if (value.length) {
          Utils.set(Constants.CONF_PASSWORD, value)
          return true
        } else {
          return 'Please enter your password'
        }
      }
    }
  ]
  return inquirer.prompt(questions)
}

function displayLoggingInToNetpieScreen () {
  const status = new CLI.Spinner('Authenticating you, please wait...')
  let username = Utils.get(Constants.CONF_USERNAME)
  let password = Utils.get(Constants.CONF_PASSWORD)
  status.start()
  return Netpie.login({username, password})
  .then(Netpie.getAppList)
  .then((msg) => {
    msg.apps.app = _.indexBy(msg.apps.app, 'appid')
    status.stop()
    status.message('Fetching apps...')
    status.start()
    configStore.set(Constants.CONF_APPS_LIST, msg.apps)
    configStore.set(Constants.CONF_IS_LOGGED_IN, true)
    return msg.apps
  })
  .then(Netpie.getAllAppDetail)
  .then((apps) => {
    status.stop()
    apps = _.indexBy(apps, 'appid')
    configStore.set(Constants.CONF_APPS_DETAIL, apps)
    return showLoggedInScreen()
  })
  .catch((err) => {
    status.stop()
    throw err
  })
}

function showSelectAppPrompt () {
  let apps = configStore.get(Constants.CONF_APPS_DETAIL)
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
        Constants.LOGIN_ACTION_LOGOUT,
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

let showSelectKeyFromAppPrompt = (appId) => {
  const NUM_MENUS = 2
  const head = ['Choice', 'Name', 'Key Type', 'App Key', 'App Secret', 'Online']
  const table = new Table({head, style: {head: ['green']}})

  let apps = configStore.get(Constants.CONF_APPS_DETAIL)
  let selectedApp = _.findWhere(apps, {appid: appId})
  let reformed = _.map(selectedApp.key, (appKey, idx) => _.pick(appKey, 'name', 'key', 'secret', 'keytype', 'online'))
  _.each(reformed, (v, k) => table.push([k + NUM_MENUS + 1, v.name, v.keytype, v.key, v.secret, v.online]))
  if (_.size(table) > 0) {
    console.log(table.toString())
  }
  let choices = _.map(reformed, (v, k) => `${v.name}`)
  return inquirer.prompt(
    {
      type: 'rawlist',
      name: 'Actions',
      message: 'Choose key what you want',
      choices: [
        Constants.LOGIN_ACTION_BACK,
        // Constants.LOGIN_ACTION_REFRESH_APP,
        new inquirer.Separator(),
        ...choices
      ]
    }
  )
}

function showLoggedInScreen () {
  return showSelectAppPrompt()
  .then((arg) => {
    const action = arg.Actions
    let when = _.partial(compare, action)
    if (when(Constants.LOGIN_ACTION_CREATE_NEW_APP)) {
      console.log(chalk.bold.yellow(`${Constants.LOGIN_ACTION_CREATE_NEW_APP} is not implemented yet.`))
      showLoggedInScreen()
    } else if (when(Constants.LOGIN_ACTION_REFRESH_APP)) {
      clear()
      displayLoggingInToNetpieScreen({
        username: configStore.get(Constants.CONF_USERNAME),
        password: configStore.get(Constants.CONF_PASSWORD)
      })
    } else if (when(Constants.LOGIN_ACTION_LOGOUT)) {
      Utils.logout()
    } else {
      /* choose appId */
      const appId = arg.Actions
      console.log(`App Id: ${chalk.bold.green(appId)}`)
      showSelectKeyFromAppPrompt(appId).then((choice) => {
        let when = _.partial(compare, choice.Actions)
        if (when(Constants.LOGIN_ACTION_BACK)) {
          clear()
          showLoggedInScreen()
        } else if (when(Constants.LOGIN_ACTION_REFRESH_APP)) {
          console.log('refresh')
        } else {
          console.log(`USER SELECTED = ${appId} - ${choice.Actions}`)
          console.log(configStore.all.apps.detail[appId].key[0])
          // table2.push(_.values(configStore.all.apps.detail[appId].key[0]))
          // table2.push(['App Id', appId], ['Choice', choice.Actions])
          // table2.push({'Some Key': 'Some Value'},
          //   {'Another much longer key': 'And its corresponding longer value'}
          // )
          // console.log(table2.toString())
          // const qrcode = require('qrcode-terminal')
          // qrcode.generate('cmmc.io')
          // showLoggedInScreen()
        }
      })
    }
  })
}

let compare = (a, b) => a === b

export { promptLogin, showFiglet, showSelectAppPrompt, showSelectKeyFromAppPrompt, displayLoggingInToNetpieScreen }
