import { reactive } from 'vue'
import { getStore, setWatchers } from './../output'

export default {
  store(space, name) {
    const store = getStore({ space, name })
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
