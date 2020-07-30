import { reactive } from '@vue/composition-api'
import { getTeddyStore, setWatchers } from './../output'

export default {
  store(space, name) {
    const store = getTeddyStore(space, name)
    if (store.features.history) {
      return
    } else {
      store.features.history = {}
    }

    store.features.history.stack = reactive([])
    setWatchers(
      { space, name },
      {
        handler(newState) {
          store.features.history.stack.push({
            state: newState,
            ts: new Date().getTime(),
          })
        },
        immediate: true,
        deep: true,
      }
    )

    store.features.history.installed = true
  },
}
