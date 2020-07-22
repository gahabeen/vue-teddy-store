import { watch } from '../api'

export const prefix = (name) => `teddy:store:${name}`
export default {
  handle({ name, store }) {
    /* istanbul ignore next */
    const localStorage = window.localStorage || global.localStorage || {}
    /* istanbul ignore next */
    if (localStorage) {
      // Fetched saved state when exists
      const cached = localStorage.getItem(prefix(name))
      if (cached) store.state = { ...store.state, ...JSON.parse(cached) }
      // Watch for mutations, save them
      watch(
        store.state,
        (newState, oldState) => {
          if (newState !== oldState) {
            localStorage.setItem(prefix(name), JSON.stringify(newState))
          }
        },
        { immediate: true, deep: true }
      )
    }
  },
}
