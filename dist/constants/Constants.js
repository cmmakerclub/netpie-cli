'use strict';

/**
 *
 * Created by Nat on 3/1/2016 AD.
 */
var keyMirror = require('keymirror');

var Constants = keyMirror({
  TYPE_APP_LIST: null,
  TYPE_APP_DETAIL: null,
  CONF_IS_LOGGED_IN: null,
  CONF_APPS_DETAIL: null,
  CONF_APPS_LIST: null
});

Constants.LOGIN_ACTION_CREATE_NEW_APP = 'Create new app';
Constants.LOGIN_ACTION_REFRESH_APP = 'Refresh';
Constants.LOGIN_ACTION_BACK = 'Back';
Constants.LOGIN_ACTION_LOGOUT = 'Logout';

Constants.CONF_USERNAME = 'credentials.username';
Constants.CONF_PASSWORD = 'credentials.password';

Constants.CONF_SELECTED_APP = 'conf.selected.app';

module.exports = Constants;