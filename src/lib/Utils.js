/** * Created by nat on 4/15/2017 AD. */

import configStore from './configstore'
// export let mutableValue;
export function isLoggedIn () {
  return configStore.get('isLoggedIn')
}
