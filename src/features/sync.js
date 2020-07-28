import { prefix } from './cache'

export default {
  handle({ name, store }) {
    /* istanbul ignore next */
    if (window) {
      window.addEventListener('storage', (e) => {
        if (e.key === prefix(name)) {
          store.state = { ...store.state, ...JSON.parse(e.newValue) }
        }
      })
    }
  },
}
