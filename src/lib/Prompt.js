import inquirer from 'inquirer'
import chalk from 'chalk'
import clear from 'clear'
import figlet from 'figlet'
import * as Constants from '../constants/Constants'
import _ from 'underscore'
import configStore from './Configstore'
import * as Netpie from './Netpie'
import * as Utils from './Utils'
import {
  NetpieAuth
} from './netpie-auth/src/NetpieAuth'
import CLI from 'clui'
import Table from 'cli-table'

let global = {
  currentAppKeysInAppSelectedAppId: '',
  appId: ''
}

function promptLogin () {
  const questions = [
    {
      name: 'username',
      type: 'input',
      default: configStore.get(Constants.CONF_USERNAME),
      message: 'Enter your NETPIE username or e-mail address:',
      validate: function (value) {
        if (value.length) {
          configStore.set(Constants.CONF_USERNAME, value)
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

let retry = 0

function displayLoggingInToNetpieScreen () {
  let status
  if (retry === 0) {
    status = new CLI.Spinner(`Authenticating you, please wait...`)
  } else {
    status = new CLI.Spinner(`Authenticating you, please wait... retrying.. ${retry}`)
  }
  let username = configStore.get(Constants.CONF_USERNAME)
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
    retry++
    if (retry > 10) {
      console.error(err)
      throw err
    }
    displayLoggingInToNetpieScreen()
  })
}

function showSelectAppPrompt () {
  let apps = configStore.get(Constants.CONF_APPS_DETAIL)
  let processed = _.map(apps, (v, k) => v.appid)
  let defaultValue = _.indexOf(processed, configStore.get(Constants.CONF_SELECTED_APP))
  return inquirer.prompt(
    {
      type: 'list',
      name: 'Actions',
      default: defaultValue,
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
      figlet.textSync(require('../../package.json').name, {horizontalLayout: 'full'})
    )
  )
}

let showSelectKeyFromAppPrompt = () => {
  const appId = configStore.get(Constants.CONF_SELECTED_APP)
  const TABLE_IDX_OFFSET = 0
  const head = ['Choice', 'Name', 'Key Type', 'App Key', 'App Secret', 'Online']
  const table = new Table({head, style: {head: ['green']}})
  const apps = configStore.get(Constants.CONF_APPS_DETAIL)
  const selectedApp = _.findWhere(apps, {appid: appId})
  const reducedAppKeys = _.map(selectedApp.key, (app, idx) => _.pick(app, 'name', 'key', 'secret', 'keytype', 'online'))
  let appKeys = []
  let inquirerType = 'list'
  global.currentAppKeysInAppSelectedAppId = reducedAppKeys
  global.appId = appId
  // fill table
  _(reducedAppKeys).each((v, k) => {
    table.push([k + TABLE_IDX_OFFSET + 1, v.name, v.keytype, v.key, v.secret, v.online])
    appKeys.push(`${v.name}`)
  })
  // let appAppKeys = _.pick(reducedAppKeys, 'key')
  // console.log('redeuced app key', reducedAppKeys)
  // console.log('allappkey', appAppKeys)
  // const allAppKeys = _.map(reducedAppKeys, (app, idx) => _.pick(app, 'key'))
  // console.log('allAppKeys', allAppKeys)
  if (_.size(table) > 0) {
    inquirerType = 'list'
    console.log(table.toString())
  } else {
    inquirerType = 'list'
    console.log(chalk.bold.yellow('No applications found.'))
  }
  // let choices = _.map(reformed, (v, k) => `${v.name}`)
  // let processed = _.map(apps, (v, k) => v.appid)
  let questions = [{
    type: inquirerType,
    name: 'Actions',
    message: 'What you want to do?',
    choices: [
      Constants.LOGIN_ACTION_BACK,
      // Constants.LOGIN_ACTION_REFRESH_APP,
      Constants.SHOW_MQTT_DETAIL,
      new inquirer.Separator()
      // ...choices
    ]
  }, {
    name: Constants.MENU_SELECTED_APP_DETAIL_KEY,
    message: 'Select applications to see the detail',
    type: 'checkbox',
    choices: appKeys,
    when: function (answers) {
      // console.log('answers', answers)
      return answers.Actions === Constants.SHOW_MQTT_DETAIL
    }
  }]
  return inquirer.prompt(questions)
}

function showAppDetailPrompt () {
  showSelectKeyFromAppPrompt().then((choice) => {
    let when = _.partial(compare, choice.Actions)
    if (when(Constants.LOGIN_ACTION_BACK)) {
      clear()
      showFiglet()
      showLoggedInScreen()
    } else if (when(Constants.LOGIN_ACTION_REFRESH_APP)) {
      clear()
      showFiglet()
      refreshApp()
    } else if (when(Constants.SHOW_MQTT_DETAIL)) {
      let selectedAppKeys = choice[Constants.MENU_SELECTED_APP_DETAIL_KEY]
      let res = _.filter(global.currentAppKeysInAppSelectedAppId, (app) => {
        return _.indexOf(selectedAppKeys, app.name) !== -1
      })
      // console.log('res', res)
      let appRes = res[0]
      // console.log('appRes', appRes)
      let netpieAuth = new NetpieAuth({appid: global.appId, appkey: appRes.key, appsecret: appRes.secret})
      netpieAuth.initSync()
      netpieAuth.getMqttAuth((mqttAuthStruct) => {
        // console.log('Auth', mqttAuthStruct)
        let {username, password, client_id, prefix, host, port} = mqttAuthStruct
// eslint-disable-next-line camelcase
        const head = ['host', 'user', 'pass', 'clientId', 'prefix', 'port']
        const table = new Table({head, style: {head: ['green']}})
        table.push([
          mqttAuthStruct.host, mqttAuthStruct.username, mqttAuthStruct.password, mqttAuthStruct.client_id, mqttAuthStruct.prefix, mqttAuthStruct.port
        ])
        console.log(table.toString())
// eslint-disable-next-line camelcase
        console.log(`mosquitto_sub -t "${prefix}/#" -h ${host} -i ${client_id} -u "${username}" -P "${password}" -p ${port} -d`)
        // tablue.push
        // const apps = configStore.get(Constants.CONF_APPS_DETAIL)
        // const selectedApp = _.findWhere(apps, {appid: appId})
        // const reducedAppKeys = _.map(selectedApp.key, (app, idx) => _.pick(app, 'name', 'key', 'secret', 'keytype', 'online'))
        // let appKeys = []
        // let inquirerType = 'list'
        // global.currentAppKeysInAppSelectedAppId = reducedAppKeys
        // global.appId = appId
        // // fill table
        // _(reducedAppKeys).each((v, k) => {
        //   table.push([k + TABLE_IDX_OFFSET + 1, v.name, v.keytype, v.key, v.secret, v.online])
        //   appKeys.push(`${v.name}`)
        // })
      }).then((response) => {
        // console.log('18', response)
      })
    } else {
      // console.log(configStore.all.apps.detail[appId].key[0])
    }
  })
}

function refreshApp () {
  displayLoggingInToNetpieScreen({
    username: configStore.get(Constants.CONF_USERNAME),
    password: configStore.get(Constants.CONF_PASSWORD)
  })
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
      showFiglet()
      refreshApp()
    } else if (when(Constants.LOGIN_ACTION_LOGOUT)) {
      Utils.logout()
    } else {
      /* choose appId */
      clear()
      const appId = arg.Actions
      console.log(`App Id: ${chalk.bold.green(appId)}`)
      configStore.set(Constants.CONF_SELECTED_APP, appId)
      showAppDetailPrompt()
    }
  })
}

let compare = (a, b) => a === b

export { promptLogin, showFiglet, showSelectAppPrompt, showSelectKeyFromAppPrompt, displayLoggingInToNetpieScreen }
