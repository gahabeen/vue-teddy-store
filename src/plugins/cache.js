import { watch } from '@vue/composition-api'

export default {
  mapper({ name, store }) {
    const prefix = (name) => `teddystore:${name}`
    if (window && window.localStorage) {
      // Fetched saved state when exists
      const cached = window.localStorage.getItem(prefix(name))
      if (cached) store._state.value = { ...store._state.value, ...JSON.parse(cached) }
      // Watch for mutations, save them
      watch(store._state, (newState) => window.localStorage.setItem(prefix(name), JSON.stringify(newState)), { immediate: true, deep: true })
    }
  },
}
