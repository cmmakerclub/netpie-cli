#!/usr/bin/env node


'use strict';

var _Prompt = require('./lib/Prompt');

var Prompt = _interopRequireWildcard(_Prompt);

var _Utils = require('./lib/Utils');

var Utils = _interopRequireWildcard(_Utils);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

Prompt.showFiglet();
if (Utils.isLoggedIn()) {
  Prompt.displayLoggingInToNetpieScreen();
} else {
  promptLogin();
}

function promptLogin() {
  Prompt.promptLogin().then(Prompt.displayLoggingInToNetpieScreen).catch(function (err) {
    console.log(_chalk2.default.bold.red(err.toString()));
    promptLogin();
  });
}
//# sourceMappingURL=app.js.map
