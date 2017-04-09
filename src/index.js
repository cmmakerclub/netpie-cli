import program from 'commander'
import { showFiglet } from './questions'
import pkg from '../package.json'

showFiglet()

program
.version(pkg.version)
.description(pkg.description)
.command('login', 'login to netpie.io')
.parse(process.argv)

if (!program.args.length) program.help()
