import inquirer from 'inquirer'
import chalk from 'chalk'
import clear from 'clear'
import figlet from 'figlet'
let configStore = require('./lib/configstore')

function promptLogin (callback) {
  const questions = [
    {
      name: 'username',
      type: 'input',
      default: configStore.get('username'),
      message: 'Enter your NETPIE username or e-mail address:',
      validate: function (value) {
        if (value.length) {
          configStore.set('username', value)
          return true
        } else {
          return 'Please enter your username or e-mail address'
        }
      }
    },
    {
      name: 'password',
      type: 'password',
      default: configStore.get('password'),
      message: 'Enter your password:',
      validate: function (value) {
        if (value.length) {
          configStore.set('password', value)
          return true
        } else {
          return 'Please enter your password'
        }
      }
    }
  ]
  return inquirer.prompt(questions).then(callback)
}

function showFiglet () {
  clear()
  console.log(
    chalk.magenta(
      figlet.textSync('netpie.js-cli', {horizontalLayout: 'full'})
    )
  )
}

export {
  promptLogin, showFiglet
}
