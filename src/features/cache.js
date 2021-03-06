import { getStore, setWatchers } from './../output'
import debounce from 'debounce'

export const prefix = (space, name) => `teddy:${space}:${name}`
export default {
  store(space, name) {
    const store = getStore({ space, name })
    if (store.features.cache) {
      // avoids resetting the same feature twice
      return
    }

    /* istanbul ignore next */
    const localStorage = window.localStorage || global.localStorage || {}
    /* istanbul ignore next */
    if (localStorage) {
      // Fetched saved state when exists
      const cached = localStorage.getItem(prefix(space, name))
      if (cached) store.state = JSON.parse(cached)
      // Watch for mutations, save them
      setWatchers(
        { space, name },
        {
          handler: debounce((newState) => {
            // try {
            localStorage.setItem(prefix(space, name), JSON.stringify(newState))
            // } catch (error) {
            //   console.warn('setting cache local', error)
            // }
          }, 200),
          immediate: true,
          deep: true,
        }
      )

      store.features.cache = true
    }
  },
}
