import chalk from 'chalk'
import clear from 'clear'
import figlet from 'figlet'
import _ from 'underscore'
import Preferences from 'preferences'
import { getCredentials } from './questions'
import { login } from './netpie'
import inquirer from 'inquirer'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0

const pref = new Preferences('config')

clear()
console.log(
  chalk.magenta(
    figlet.textSync('netpie.js-cli', {horizontalLayout: 'full'})
  )
)

getCredentials((...args) => {
  args[0].username = 'nat.wrw@gmail.com'
  args[0].password = 'UoTR8IG19oh7'
  pref.netpie = {username: args.username, password: args.password}
  login(...args, (args2) => {
    let j = JSON.parse(args2)
    let processed = _.map(j, (v, k) => { return v.appid })
    inquirer.prompt(
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
  })
})
