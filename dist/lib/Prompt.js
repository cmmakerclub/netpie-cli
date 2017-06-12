'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.displayLoggingInToNetpieScreen = exports.showSelectKeyFromAppPrompt = exports.showSelectAppPrompt = exports.showFiglet = exports.promptLogin = undefined;

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _inquirer = require('inquirer');

var _inquirer2 = _interopRequireDefault(_inquirer);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _clear = require('clear');

var _clear2 = _interopRequireDefault(_clear);

var _figlet = require('figlet');

var _figlet2 = _interopRequireDefault(_figlet);

var _Constants = require('../constants/Constants');

var Constants = _interopRequireWildcard(_Constants);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _Configstore = require('./Configstore');

var _Configstore2 = _interopRequireDefault(_Configstore);

var _Netpie = require('./Netpie');

var Netpie = _interopRequireWildcard(_Netpie);

var _Utils = require('./Utils');

var Utils = _interopRequireWildcard(_Utils);

var _NetpieAuth = require('./netpie-auth/src/NetpieAuth');

var _clui = require('clui');

var _clui2 = _interopRequireDefault(_clui);

var _cliTable = require('cli-table');

var _cliTable2 = _interopRequireDefault(_cliTable);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var global = {
  currentAppKeysInAppSelectedAppId: '',
  appId: ''
};

function promptLogin() {
  var questions = [{
    name: 'username',
    type: 'input',
    default: _Configstore2.default.get(Constants.CONF_USERNAME),
    message: 'Enter your NETPIE username or e-mail address:',
    validate: function validate(value) {
      if (value.length) {
        _Configstore2.default.set(Constants.CONF_USERNAME, value);
        return true;
      } else {
        return 'Please enter your username or e-mail address';
      }
    }
  }, {
    name: 'password',
    type: 'password',
    default: Utils.get(Constants.CONF_PASSWORD),
    message: 'Enter your password:',
    validate: function validate(value) {
      if (value.length) {
        Utils.set(Constants.CONF_PASSWORD, value);
        return true;
      } else {
        return 'Please enter your password';
      }
    }
  }];
  return _inquirer2.default.prompt(questions);
}

var retry = 0;

function displayLoggingInToNetpieScreen() {
  var status = void 0;
  if (retry === 0) {
    status = new _clui2.default.Spinner('Authenticating you, please wait...');
  } else {
    status = new _clui2.default.Spinner('Authenticating you, please wait... retrying.. ' + retry);
  }
  var username = _Configstore2.default.get(Constants.CONF_USERNAME);
  var password = Utils.get(Constants.CONF_PASSWORD);
  status.start();
  return Netpie.login({ username: username, password: password }).then(Netpie.getAppList).then(function (msg) {
    msg.apps.app = _underscore2.default.indexBy(msg.apps.app, 'appid');
    status.stop();
    status.message('Fetching apps...');
    status.start();
    _Configstore2.default.set(Constants.CONF_APPS_LIST, msg.apps);
    _Configstore2.default.set(Constants.CONF_IS_LOGGED_IN, true);
    return msg.apps;
  }).then(Netpie.getAllAppDetail).then(function (apps) {
    status.stop();
    apps = _underscore2.default.indexBy(apps, 'appid');
    _Configstore2.default.set(Constants.CONF_APPS_DETAIL, apps);
    return showLoggedInScreen();
  }).catch(function (err) {
    status.stop();
    retry++;
    if (retry > 10) {
      console.error(err);
      throw err;
    }
    displayLoggingInToNetpieScreen();
  });
}

function showSelectAppPrompt() {
  var apps = _Configstore2.default.get(Constants.CONF_APPS_DETAIL);
  var processed = _underscore2.default.map(apps, function (v, k) {
    return v.appid;
  });
  var defaultValue = _underscore2.default.indexOf(processed, _Configstore2.default.get(Constants.CONF_SELECTED_APP));
  return _inquirer2.default.prompt({
    type: 'list',
    name: 'Actions',
    default: defaultValue,
    message: 'What do you want to do?',
    choices: [].concat((0, _toConsumableArray3.default)(processed), [new _inquirer2.default.Separator(), Constants.LOGIN_ACTION_CREATE_NEW_APP, Constants.LOGIN_ACTION_REFRESH_APP, Constants.LOGIN_ACTION_LOGOUT, new _inquirer2.default.Separator()])
  });
}

function showFiglet() {
  (0, _clear2.default)();
  console.log(_chalk2.default.magenta(_figlet2.default.textSync(require('../../package.json').name, { horizontalLayout: 'full' })));
}

var showSelectKeyFromAppPrompt = function showSelectKeyFromAppPrompt() {
  var appId = _Configstore2.default.get(Constants.CONF_SELECTED_APP);
  var TABLE_IDX_OFFSET = 0;
  var head = ['Choice', 'Name', 'Key Type', 'App Key', 'App Secret', 'Online'];
  var table = new _cliTable2.default({ head: head, style: { head: ['green'] } });
  var apps = _Configstore2.default.get(Constants.CONF_APPS_DETAIL);
  var selectedApp = _underscore2.default.findWhere(apps, { appid: appId });
  var reducedAppKeys = _underscore2.default.map(selectedApp.key, function (app, idx) {
    return _underscore2.default.pick(app, 'name', 'key', 'secret', 'keytype', 'online');
  });
  var appKeys = [];
  var inquirerType = 'list';
  global.currentAppKeysInAppSelectedAppId = reducedAppKeys;
  global.appId = appId;
  // fill table
  (0, _underscore2.default)(reducedAppKeys).each(function (v, k) {
    table.push([k + TABLE_IDX_OFFSET + 1, v.name, v.keytype, v.key, v.secret, v.online]);
    appKeys.push('' + v.name);
  });
  // let appAppKeys = _.pick(reducedAppKeys, 'key')
  // console.log('redeuced app key', reducedAppKeys)
  // console.log('allappkey', appAppKeys)
  // const allAppKeys = _.map(reducedAppKeys, (app, idx) => _.pick(app, 'key'))
  // console.log('allAppKeys', allAppKeys)
  if (_underscore2.default.size(table) > 0) {
    inquirerType = 'list';
    console.log(table.toString());
  } else {
    inquirerType = 'list';
    console.log(_chalk2.default.bold.yellow('No applications found.'));
  }
  // let choices = _.map(reformed, (v, k) => `${v.name}`)
  // let processed = _.map(apps, (v, k) => v.appid)
  var questions = [{
    type: inquirerType,
    name: 'Actions',
    message: 'What you want to do?',
    choices: [Constants.LOGIN_ACTION_BACK,
    // Constants.LOGIN_ACTION_REFRESH_APP,
    Constants.SHOW_MQTT_DETAIL, new _inquirer2.default.Separator()
    // ...choices
    ]
  }, {
    name: Constants.MENU_SELECTED_APP_DETAIL_KEY,
    message: 'Select applications to see the detail',
    type: 'checkbox',
    choices: appKeys,
    when: function when(answers) {
      // console.log('answers', answers)
      return answers.Actions === Constants.SHOW_MQTT_DETAIL;
    }
  }];
  return _inquirer2.default.prompt(questions);
};

function showAppDetailPrompt() {
  showSelectKeyFromAppPrompt().then(function (choice) {
    var when = _underscore2.default.partial(compare, choice.Actions);
    if (when(Constants.LOGIN_ACTION_BACK)) {
      (0, _clear2.default)();
      showFiglet();
      showLoggedInScreen();
    } else if (when(Constants.LOGIN_ACTION_REFRESH_APP)) {
      (0, _clear2.default)();
      showFiglet();
      refreshApp();
    } else if (when(Constants.SHOW_MQTT_DETAIL)) {
      var selectedAppKeys = choice[Constants.MENU_SELECTED_APP_DETAIL_KEY];
      var res = _underscore2.default.filter(global.currentAppKeysInAppSelectedAppId, function (app) {
        return _underscore2.default.indexOf(selectedAppKeys, app.name) !== -1;
      });
      // console.log('res', res)
      var appRes = res[0];
      // console.log('appRes', appRes)
      var netpieAuth = new _NetpieAuth.NetpieAuth({ appid: global.appId, appkey: appRes.key, appsecret: appRes.secret });
      netpieAuth.initSync();
      netpieAuth.getMqttAuth(function (mqttAuthStruct) {
        // console.log('Auth', mqttAuthStruct)
        var username = mqttAuthStruct.username,
            password = mqttAuthStruct.password,
            client_id = mqttAuthStruct.client_id,
            prefix = mqttAuthStruct.prefix,
            host = mqttAuthStruct.host,
            port = mqttAuthStruct.port;
        // eslint-disable-next-line camelcase

        var head = ['host', 'user', 'pass', 'clientId', 'prefix', 'port'];
        var table = new _cliTable2.default({ head: head, style: { head: ['green'] } });
        table.push([mqttAuthStruct.host, mqttAuthStruct.username, mqttAuthStruct.password, mqttAuthStruct.client_id, mqttAuthStruct.prefix, mqttAuthStruct.port]);
        console.log(table.toString());
        // eslint-disable-next-line camelcase
        console.log('mosquitto_sub -t "' + prefix + '/#" -h ' + host + ' -i ' + client_id + ' -u "' + username + '" -P "' + password + '" -p ' + port + ' -d');
        // tablue.push
        // const apps = configStore.get(Constants.CONF_APPS_DETAIL)
        // const selectedApp = _.findWhere(apps, {appid: appId})
        // const reducedAppKeys = _.map(selectedApp.key, (app, idx) => _.pick(app, 'name', 'key', 'secret', 'keytype', 'online'))
        // let appKeys = []
        // let inquirerType = 'list'
        // global.currentAppKeysInAppSelectedAppId = reducedAppKeys
        // global.appId = appId
        // // fill table
        // _(reducedAppKeys).each((v, k) => {
        //   table.push([k + TABLE_IDX_OFFSET + 1, v.name, v.keytype, v.key, v.secret, v.online])
        //   appKeys.push(`${v.name}`)
        // })
      }).then(function (response) {
        // console.log('18', response)
      });
    } else {
        // console.log(configStore.all.apps.detail[appId].key[0])
      }
  });
}

function refreshApp() {
  displayLoggingInToNetpieScreen({
    username: _Configstore2.default.get(Constants.CONF_USERNAME),
    password: _Configstore2.default.get(Constants.CONF_PASSWORD)
  });
}

function showLoggedInScreen() {
  return showSelectAppPrompt().then(function (arg) {
    var action = arg.Actions;
    var when = _underscore2.default.partial(compare, action);
    if (when(Constants.LOGIN_ACTION_CREATE_NEW_APP)) {
      console.log(_chalk2.default.bold.yellow(Constants.LOGIN_ACTION_CREATE_NEW_APP + ' is not implemented yet.'));
      showLoggedInScreen();
    } else if (when(Constants.LOGIN_ACTION_REFRESH_APP)) {
      (0, _clear2.default)();
      showFiglet();
      refreshApp();
    } else if (when(Constants.LOGIN_ACTION_LOGOUT)) {
      Utils.logout();
    } else {
      /* choose appId */
      (0, _clear2.default)();
      var appId = arg.Actions;
      console.log('App Id: ' + _chalk2.default.bold.green(appId));
      _Configstore2.default.set(Constants.CONF_SELECTED_APP, appId);
      showAppDetailPrompt();
    }
  });
}

var compare = function compare(a, b) {
  return a === b;
};

exports.promptLogin = promptLogin;
exports.showFiglet = showFiglet;
exports.showSelectAppPrompt = showSelectAppPrompt;
exports.showSelectKeyFromAppPrompt = showSelectKeyFromAppPrompt;
exports.displayLoggingInToNetpieScreen = displayLoggingInToNetpieScreen;