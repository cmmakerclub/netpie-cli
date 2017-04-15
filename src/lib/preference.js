'use strict'

var Preferences = require('preferences')
var pkg = require('../../package.json')

// Get the prefs
// Init a Configstore instance with an unique ID eg. package name
// and optionally some default values
module.exports = new Preferences(pkg.name)
