/** * Created by nat on 4/15/2017 AD. */

import configStore from './configstore'
import { CONF_IS_LOGGED_IN } from '../constants/Constants'
// export let mutableValue;
export function isLoggedIn () {
  return configStore.get(CONF_IS_LOGGED_IN)
}

export function logout () {
  configStore.delete('apps')
  configStore.delete('appkeys')
  configStore.delete('credentials.password')
  configStore.set('isLoggedIn', false)
}
