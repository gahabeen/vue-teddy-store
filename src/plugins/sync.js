import { reactive } from '@vue/composition-api'
import { prefix } from './cache'

export default {
  handle({ name, store }) {
    /* istanbul ignore next */
    if (window) {
      window.addEventListener('storage', (e) => {
        if (e.key === prefix(name)) {
          store._state = reactive({ ...store._state, ...JSON.parse(e.newValue) })
        }
      })
    }
  },
}
