'use strict'
import * as Prompt from './questions'
import * as Utils from './lib/Utils'

Prompt.showFiglet()

if (Utils.isLoggedIn()) {
  Prompt.displayLoggingInToNetpieScreen()
} else {
  Prompt.promptLogin().then(Prompt.displayLoggingInToNetpieScreen)
}
