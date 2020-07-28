const target = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : { __VUE_DEVTOOLS_GLOBAL_HOOK__: undefined }
const devtoolHook = target.__VUE_DEVTOOLS_GLOBAL_HOOK__

export function registerForDevtools(store) {
  if (!devtoolHook) {
    return
  }

  // save on store the listened paths
  store._listenedPaths = []

  const watchers = []

  function listen(state, parentKey = '') {
    for (const key in state) {
      const path = `${parentKey}${parentKey ? '.' : ''}${key}`

      if (store._listenedPaths.includes(path)) {
        continue
      }

      store._listenedPaths.push(path)

      const watchChildren = (child) => {
        if (typeof child === 'object') {
          listen(child, path)
        }
      }

      console.log('register watcher', path)

      watchers.push({
        path,
        handler(value) {
          watchChildren(value)

          console.log(
            'fired on',
            path,
            {
              type: 'change',
              payload: {
                key: path,
                value,
              },
            },
            store.state
          )

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

      watchChildren(state[key])
    }
  }

  const wrappedStore = {
    ...store,
    _devtoolHook: devtoolHook,
    _vm: { $options: { computed: {} } },
    _mutations: {},
    replaceState: (state) => {
      console.log('replace state', state)
    },
  }

  // Object.defineProperty(wrappedStore, 'state', {
  //   get: () => store.state,
  // })

  Object.defineProperty(wrappedStore, 'getters', {
    get: () => store._getters,
  })

  devtoolHook.emit('vuex:init', wrappedStore)

  devtoolHook.on('vuex:travel-to-state', (targetState) => {
    console.log('vuex:travel-to-state', targetState)
    // TODO: this doesnt reset keys added after targetState
    Object.assign(store.state, targetState)
  })

  devtoolHook.on('vuex:commit-all', (newState) => {
    console.log('vuex:commit-all', newState)
  })

  devtoolHook.on('vuex:revert-all', (newState) => {
    console.log('vuex:revert-all', newState)
  })

  devtoolHook.on('vuex:commit', (newState) => {
    console.log('vuex:commit', newState)
  })

  devtoolHook.on('vuex:revert', (newState) => {
    console.log('vuex:revert', newState)
  })

  devtoolHook.on('vuex:import-state', (newState) => {
    console.log('vuex:import-state', newState)
  })

  devtoolHook.on('vuex:edit-state', (newState) => {
    console.log('vuex:edit-state', newState)
  })

  // listen for changes to emit vuex:mutations
  listen(store.state)

  return { watchers }
}
