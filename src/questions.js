import inquirer from 'inquirer'
import chalk from 'chalk'
import clear from 'clear'
import figlet from 'figlet'
import * as Constants from './constants/Constants'
let configStore = require('./lib/configstore')

function promptLogin (callback) {
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
  return inquirer.prompt(questions).then(callback)
}

function promptAppkey () {

}

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

export {
  promptLogin, showFiglet, promptAppkey, showSelectAppPrompt, showSelectKeyFromAppPrompt
}
