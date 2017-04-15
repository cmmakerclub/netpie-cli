'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.get = exports.isLoggedIn = undefined;
exports.logout = logout;
exports.set = set;

var _Configstore = require('./Configstore');

var _Configstore2 = _interopRequireDefault(_Configstore);

var _Preference = require('./Preference');

var _Preference2 = _interopRequireDefault(_Preference);

var _Constants = require('../constants/Constants');

var Constants = _interopRequireWildcard(_Constants);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var isLoggedIn = exports.isLoggedIn = function isLoggedIn() {
  return _Configstore2.default.get(Constants.CONF_IS_LOGGED_IN);
}; /** * Created by nat on 4/15/2017 AD. */

function logout() {
  _Configstore2.default.delete(Constants.CONF_APPS_DETAIL);
  _Configstore2.default.delete(Constants.CONF_APPS_LIST);
  _Configstore2.default.delete(Constants.CONF_PASSWORD);
  set(Constants.CONF_PASSWORD, '');
  _Configstore2.default.set(Constants.CONF_IS_LOGGED_IN, false);
}

function set(field, value) {
  // if (field === Constants.CONF_USERNAME) {
  //   pref[field] = username
  // }
  _Preference2.default[field] = value;
}

var get = exports.get = function get(field) {
  return _Preference2.default[field];
};