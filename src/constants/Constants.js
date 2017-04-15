/**
 *
 * Created by Nat on 3/1/2016 AD.
 */
var keyMirror = require('keymirror')

const Constants = keyMirror({
  TYPE_APP_LIST: null,
  TYPE_APP_DETAIL: null
})

Constants.LOGIN_ACTION_CREATE_NEW_APP = 'Create new app'
Constants.LOGIN_ACTION_REFRESH_APP = 'Refresh'
Constants.LOGIN_ACTION_BACK = 'Back'
Constants.LOGIN_ACTION_LOGOUT = 'Logout'

Constants.CONF_APPS_KEY = 'appkeys'
Constants.CONF_APPS_LIST = 'apps'
Constants.CONF_USERNAME = 'credentials.username'
Constants.CONF_PASSWORD = 'credentials.password'
Constants.CONF_IS_LOGGED_IN = 'isLoggedIn'

module.exports = Constants
