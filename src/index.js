import chalk from 'chalk'
import clear from 'clear'
import figlet from 'figlet'
import Preferences from 'preferences'
import { getCredentials } from './questions'

const pref = new Preferences('config')

clear()
console.log(
  chalk.magenta(
    figlet.textSync('netpie-cli', {horizontalLayout: 'full'})
  )
)

getCredentials((...args) => {
  console.log(args)
  pref.netpie = args
  console.log(pref)
})
