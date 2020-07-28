import * as VueCompositionMethods from '@vue/composition-api'
import { isRef, ref, watch } from '@vue/composition-api'
import { isObject } from 'object-string-path'
import * as accessors from './accessors'
import { initTeddy, initTeddyStore } from './store'
import * as utils from './utils'

export const setStore = (namespace, namesign, store) => {
  const _store = initTeddyStore(namespace, namesign, store)
  makeState(namespace, namesign, store.state)
  setGetters(namespace, namesign, store.getters)
  setActions(namespace, namesign, store.actions)
  setWatchers(namespace, namesign, store.watchers)
  return _store
}

const makeState = (_, __, state) => {
  return isRef(state) ? state : ref(state)
}

const setState = (namespace, namesign, state) => {
  const store = initTeddyStore(namespace, namesign)

  store._state = makeState(namespace, namesign, state)

  Object.defineProperty(store, 'state', {
    get: () => store._state.value,
    set: (newState) => {
      store._state.value = newState
    },
    enumerable: true,
  })
}

export const makeGetters = (namespace, namesign, getters) => {
  const store = initTeddyStore(namespace, namesign)
  getters = getters || {}
  return Object.keys(getters).reduce((acc, key) => {
    if (utils.isComputed(getters[key])) {
      acc[key] = getters[key]
    } else if (typeof getters[key] === 'function') {
      acc[key] = computed(() => getters[key](store))
    }
    return acc
  }, {})
}

export const setGetters = (namespace, namesign, getters) => {
  const store = initTeddyStore(namespace, namesign)
  store.getters = { ...(store.getters || {}), ...makeGetters(namespace, namesign, getters) }
}

export const makeActions = (namespace, namesign, actions) => {
  const store = initTeddyStore(namespace, namesign)
  actions = actions || {}
  return Object.keys(actions).reduce((acc, key) => {
    if (typeof actions[key] === 'function') {
      acc[key] = (...args) => actions[key](store, ...args)
    }
    return acc
  }, {})
}

export const setActions = (namespace, namesign, actions) => {
  const store = initTeddyStore(namespace, namesign)
  store.actions = { ...(store.actions || {}), ...makeActions(namespace, namesign, actions) }
}

export const makeWatchers = (namespace, namesign, watchers) => {
  const store = initTeddyStore(namespace, namesign)

  const _watchers = []
  if (Array.isArray(watchers)) {
    _watchers.push(...watchers)
  } else if (watchers) {
    _watchers.push(watchers)
  }

  // If no watchers
  if (_watchers.length === 0) return

  return _watchers.reduce((list, watcher) => {
    const register = (path, _watcher, handler, options) => {
      list.push({
        path,
        handler,
        options,
        unwatch: watch(_watcher, handler, { deep: true, ...options }),
      })
    }

    // Watcher is a function
    if (typeof watcher === 'function') {
      register(`state`, () => store.state, watcher, { deep: true })
    }
    // Watcher is an object definition with a .handler()
    else if (watcher && typeof watcher === 'object' && 'handler' in watcher) {
      const { handler, path, paths = [], ...options } = watcher
      // Contains a path
      if (typeof path === 'string') {
        register(path, () => accessors.makeTeddyGet()(store, utils.resolvePath([namesign, path])), handler, { deep: true, ...options })
      }
      // Contains paths
      else if (paths.length > 0) {
        register(
          paths.map((p) => utils.resolvePath([namesign, p])),
          paths.map((p) => () => accessors.makeTeddyGet()(store, utils.resolvePath([namesign, p]))),
          handler,
          { deep: true, ...options }
        )
      }
      // Global watcher
      else {
        register(`state`, () => store.state, handler, { deep: true, ...options })
      }
    }
    return list
  }, [])
}

export const setWatchers = (namespace, namesign, watchers) => {
  const store = initTeddyStore(namespace, namesign)
  store.watchers = [...(store.watchers || []), ...makeWatchers(namespace, namesign, watchers)]
}

export const exists = (namespace, namesign) => {
  const teddy = initTeddy(namespace)
  return namesign in teddy.stores
}

export const remove = (namespace, namesign) => {
  const teddy = initTeddy(namespace)
  if (namesign in teddy.stores) delete teddy.stores[namesign]
}

// eslint-disable-next-line no-unused-vars
export const reset = (namespace, __) => {
  const teddy = initTeddy(namespace)
  for (const namesign in teddy.stores) {
    remove(namespace, namesign)
  }
}

export const has = (namespace, namesign, path, context) => {
  const store = initTeddyStore(namespace, namesign)
  const _has = accessors.makeTeddyHas()
  return _has(store, path, context)
}

export const get = (namespace, namesign, path, context) => {
  const store = initTeddyStore(namespace, namesign)
  const _get = accessors.makeTeddyGet()
  return _get(store, path, context)
}

export const getter = (namespace, namesign, path, context) => {
  return function() {
    return get(namespace, namesign, path, context || this)
  }
}

export const set = (namespace, namesign, path, value, context) => {
  const store = initTeddyStore(namespace, namesign)
  const _set = accessors.makeTeddySet()
  _set(store, path, value, context)
}

export const setter = (namespace, namesign, path, context) => {
  return function(value) {
    set(namespace, namesign, path, value, context || this)
  }
}

export const sync = (namespace, namesign, path, context) => {
  const _sync = (path, context) => {
    return {
      get: getter(namespace, namesign, path, context),
      set: setter(namespace, namesign, path, context),
    }
  }

  // If array, export all sub path as synced properties
  // Tip: use ...sync()
  if (Array.isArray(path)) {
    return path.reduce((acc, prop) => {
      acc[prop] = _sync(prop, context)
      return acc
    }, {})
  }
  // If object, export all synced properties path
  // Tip: use ...sync()
  else if (isObject(path)) {
    return Object.keys(path).reduce((acc, key) => {
      acc[key] = _sync(path[key], context)
      return acc
    }, {})
  }
  // By default, return the synced property path
  else {
    return _sync(path, context)
  }
}

export const computed = (definition) => {
  if (isObject(definition)) {
    const hasGetter = 'get' in definition && typeof definition.get === 'function'
    const hasSetter = 'set' in definition && typeof definition.set === 'function'
    if (hasGetter || hasSetter) {
      return VueCompositionMethods.computed(definition)
    } else {
      return Object.keys(definition).reduce((acc, key) => {
        acc[key] = VueCompositionMethods.computed(definition[key])
        return acc
      }, {})
    }
  } else {
    return VueCompositionMethods.computed(definition)
  }
}

export const useTeddy = (namespace = '$') => {
  const proxy = (fn) => (...args) => fn(namespace, ...args)
  return {
    setStore: proxy(setStore),
    makeState: proxy(makeState),
    setState: proxy(setState),
    makeGetters: proxy(makeGetters),
    setGetters: proxy(setGetters),
    makeActions: proxy(makeActions),
    setActions: proxy(setActions),
    makeWatchers: proxy(makeWatchers),
    setWatchers: proxy(setWatchers),
    exists: proxy(exists),
    remove: proxy(remove),
    reset: proxy(reset),
    has: proxy(has),
    get: proxy(get),
    getter: proxy(getter),
    set: proxy(set),
    setter: proxy(setter),
    sync: proxy(sync),
  }
}

export const useTeddyStore = (namespace = '$', namesign = '@') => {
  const proxy = (fn) => (...args) => fn(namesign, ...args)
  const proxies = useTeddy(namespace)
  return Object.keys(proxies).reduce((acc, key) => {
    acc[key] = proxy(proxies[key])
    return acc
  }, {})
}
