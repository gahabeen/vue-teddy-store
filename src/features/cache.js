import { getTeddyStore, setWatchers } from '@/index'

export const prefix = (spaceName, storeName) => `teddy:${spaceName}:${storeName}`
export default {
  teddy: {
    extend() {},
  },
  space: {
    extend() {},
  },
  store: {
    extend(spaceName, storeName) {
      const store = getTeddyStore(spaceName, storeName)
      /* istanbul ignore next */
      const localStorage = window.localStorage || global.localStorage || {}
      /* istanbul ignore next */
      if (localStorage) {
        // Fetched saved state when exists
        const cached = localStorage.getItem(prefix(spaceName, storeName))
        if (cached) store.state = { ...store.state, ...JSON.parse(cached) }
        // Watch for mutations, save them
        setWatchers(spaceName, storeName, {
          handler(newState, oldState) {
            if (newState !== oldState) {
              localStorage.setItem(prefix(spaceName, storeName), JSON.stringify(newState))
            }
          },
          immediate: true,
          deep: true,
        })
      }
    },
  },
}
