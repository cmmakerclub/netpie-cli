/** * Created by nat on 4/15/2017 AD. */

import configStore from './configstore'
import * as Constants from '../constants/Constants'

export let isLoggedIn = () => configStore.get(Constants.CONF_IS_LOGGED_IN)

export function logout () {
  configStore.delete(Constants.CONF_APPS_DETAIL)
  configStore.delete(Constants.CONF_APPS_LIST)
  configStore.delete(Constants.CONF_PASSWORD)
  configStore.set(Constants.CONF_IS_LOGGED_IN, false)
}
