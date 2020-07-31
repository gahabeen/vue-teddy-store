import { getStore } from './../output'
import { prefix } from './cache'

export default {
  store(space, name) {
    const store = getStore({ space, name })
    if (store.features.sync) {
      return
    } else {
      store.features.sync = {}
    }

    /* istanbul ignore next */
    if (window) {
      window.addEventListener('storage', (e) => {
        if (e.key === prefix(name)) {
          store.state = { ...store.state, ...JSON.parse(e.newValue) }
        }
      })
    }

    store.features.sync.installed = true
  },
}
