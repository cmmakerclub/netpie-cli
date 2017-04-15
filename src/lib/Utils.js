/** * Created by nat on 4/15/2017 AD. */

import configStore from './Configstore'
import pref from './Preference'
import * as Constants from '../constants/Constants'

export let isLoggedIn = () => configStore.get(Constants.CONF_IS_LOGGED_IN)

export function logout () {
  configStore.delete(Constants.CONF_APPS_DETAIL)
  configStore.delete(Constants.CONF_APPS_LIST)
  configStore.delete(Constants.CONF_PASSWORD)
  set(Constants.CONF_PASSWORD, '')
  configStore.set(Constants.CONF_IS_LOGGED_IN, false)
}

export function set (field, value) {
  // if (field === Constants.CONF_USERNAME) {
  //   pref[field] = username
  // }
  pref[field] = value
}

export let get = (field) => pref[field]
