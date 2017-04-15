'use strict'
import * as Prompt from './questions'

Prompt.showFiglet()
Prompt.promptLogin().then(Prompt.displayLoggingInToNetpieScreen)
