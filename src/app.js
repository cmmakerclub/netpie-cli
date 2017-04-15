#!/usr/bin/env node

'use strict'
import * as Prompt from './lib/Prompt'
import * as Utils from './lib/Utils'
import chalk from 'chalk'

Prompt.showFiglet()
if (Utils.isLoggedIn()) {
  Prompt.displayLoggingInToNetpieScreen()
} else {
  promptLogin()
}

function promptLogin () {
  Prompt.promptLogin()
  .then(Prompt.displayLoggingInToNetpieScreen)
  .catch((err) => {
    console.log(chalk.bold.red(err.toString()))
    promptLogin()
  })
}
