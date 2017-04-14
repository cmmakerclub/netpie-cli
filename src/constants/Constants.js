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

module.exports = Constants
