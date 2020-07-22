import { reactive, watch } from'../api'

export default {
  handle({ store }) {
    store._history = reactive([])
    watch(
      store.state,
      (newState) => {
        store._history.push(newState)
      },
      { immediate: true, deep: true }
    )
  },
}
