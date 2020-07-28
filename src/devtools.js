const target = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : { __VUE_DEVTOOLS_GLOBAL_HOOK__: undefined }
const devtoolHook = target.__VUE_DEVTOOLS_GLOBAL_HOOK__

const listenedPaths = []

export function registerForDevtools(name, store) {
  if (!devtoolHook) {
    return
  }

  function listen(state, parentKey = '') {
    for (const key in state) {
      const path = `${parentKey}${parentKey ? '.' : ''}${key}`

      if (listenedPaths.includes(path)) {
        continue
      }

      listenedPaths.push(path)

      const registerChildren = (child) => {
        if (typeof child === 'object') {
          listen(child, path)
        }
      }

      store.registerWatchers(name, {
        path,
        handler(value) {
          registerChildren(value)

          devtoolHook.emit(
            'vuex:mutation',
            {
              type: 'change',
              payload: {
                key: path,
                value,
              },
            },
            store.state
          )
        },
      })

      registerChildren(state[key])
    }
  }

  Object.defineProperty(store, 'getters', {
    get: () => store._getters,
  })

  const wrappedStore = {
    ...store,
    _devtoolHook: devtoolHook,
    _vm: { $options: { computed: {} } },
    _mutations: {},
    replaceState: () => {},
  }

  devtoolHook.emit('vuex:init', wrappedStore)

  devtoolHook.on('vuex:travel-to-state', (targetState) => {
    // TODO: this doesnt reset keys added after targetState
    Object.assign(store.state, targetState)
  })

  // listen for changes to emit vuex:mutations
  listen(store.state)
}
