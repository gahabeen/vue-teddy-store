import { ref } from '@vue/composition-api'

export const TeddiesRef = Symbol()

const Teddies = ref({
  __options: { devtools: true },
  spaces: {
    $: {
      options: { devtools: true },
      stores: {
        '@': {
          _state: {},
          state: {},
          getters: {},
          actions: {},
          watchers: [], // { path, handler }
          options: { devtools: true },
        },
      },
    },
  },
})

export const initTeddy = (namespace = '$') => {
  if (!Teddies.value.spaces[namespace]) Teddies.value.spaces[namespace] = {}
  return Teddies.value.spaces[namespace]
}

export const initTeddyStore = (namespace = '$', namesigne = '@', store = {}) => {
  if (!Teddies.value.spaces[namespace]) Teddies.value.spaces[namespace] = {}
  if (!Teddies.value.spaces[namespace].stores) Teddies.value.spaces[namespace].stores = {}
  if (!Teddies.value.spaces[namespace].stores[namesigne]) Teddies.value.spaces[namespace].stores[namesigne] = store
  return Teddies.value.spaces[namespace].stores[namesigne]
}

export default Teddies
