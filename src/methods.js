import * as VueCompositionMethods from '@vue/composition-api'
import equal from 'fast-deep-equal'
import { isRef, ref, watch } from '@vue/composition-api'
import { isObject } from 'object-string-path'
import * as accessors from './accessors'
import { Teddies, Teddy, TeddyStore } from './store'
import * as utils from './utils'

const DEFAULT_SPACE_NAME = '$'
const DEFAULT_STORE_NAME = '@'

const parseDefinition = (definition) => {
  let _space
  let _name

  if (isObject(definition)) {
    _space = 'space' in definition ? definition.space : DEFAULT_SPACE_NAME
    _name = 'name' in definition ? definition.name : DEFAULT_STORE_NAME
  } else if (typeof definition === 'string') {
    if (definition.includes('.')) {
      let [space, name] = definition.split('.')
      _space = space
      _name = name
    } else if (definition.includes('/')) {
      let [space, name] = definition.split('/')
      _space = space
      _name = name
    } else {
      _space = DEFAULT_SPACE_NAME
      _name = definition
    }
  }

  if (typeof _space === 'string') {
    _space = _space.trim()
    if (_space.length === 0) {
      _space = undefined
    }
  }
  if (typeof _name === 'string') {
    _name = _name.trim()
    if (_name.length === 0) {
      _name = undefined
    }
  }

  return { space: _space, name: _name }
}

export const setStore = (definition, store) => {
  const _definition = parseDefinition(definition)
  store = store || {}
  const _store = getStore(_definition)
  setState(_definition, store.state)
  setGetters(_definition, store.getters)
  setActions(_definition, store.actions)
  setWatchers(_definition, store.watchers)
  return _store
}

export const makeState = (_, state) => {
  return isRef(state) ? state : ref(state)
}

export const applyState = (definition, state, destination = {}) => {
  destination._state = makeState(definition, state)
  if (!('state' in destination)) {
    Object.defineProperty(destination, 'state', {
      get: () => destination._state.value,
      set: (newState) => {
        destination._state.value = newState
      },
      enumerable: true,
    })
  }
  return destination
}

export const setState = (definition, state) => {
  const store = getStore(definition)
  applyState(definition, state, store)
}

export const makeGetters = (definition, getters) => {
  const store = getStore(definition)
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

export const setGetters = (definition, getters) => {
  const store = getStore(definition)
  store.getters = { ...(store.getters || {}), ...makeGetters(definition, getters) }
  return store
}

export const makeActions = (definition, actions) => {
  const store = getStore(definition)
  actions = actions || {}
  return Object.keys(actions).reduce((acc, key) => {
    if (typeof actions[key] === 'function') {
      acc[key] = (...args) => actions[key](store, ...args)
    }
    return acc
  }, {})
}

export const setActions = (definition, actions) => {
  const store = getStore(definition)
  store.actions = { ...(store.actions || {}), ...makeActions(definition, actions) }
  return store
}

export const makeWatchers = (definition, watchers) => {
  const { space, name } = parseDefinition(definition)
  const store = getStore(definition)

  const _watchers = []
  if (Array.isArray(watchers)) {
    _watchers.push(...watchers)
  } else if (watchers) {
    _watchers.push(watchers)
  }

  // If no watchers
  if (_watchers.length === 0) return []

  return _watchers.reduce((list, watcher) => {
    // NOTE: Added the wrapper because of some weird reactivity with memoize. To keep an eye on.
    const wrapper = (fn) =>
      function(newState, oldState) {
        if (!equal(newState, oldState)) {
          fn.call(this, newState, oldState)
        }
      }

    const signWatcher = (path = '', handler) => `${path}||${handler.toString()}`
    const register = (path, watching, handler, options) => {
      list.push({
        path,
        signature: signWatcher(path, handler),
        options,
        start() {
          this.unwatch = watch(watching, wrapper(handler), { deep: true, ...options })
          return this
        },
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
        register(path, () => accessors.teddyGet(space, name)(store, path), handler, { deep: true, ...options })
      }
      // Contains paths
      else if (paths.length > 0) {
        register(
          paths.map((p) => utils.resolvePath([name, p])),
          paths.map((p) => () => accessors.teddyGet(space, name)(store, p)),
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

export const setWatchers = (definition, watchers) => {
  const store = getStore(definition)
  for (const watcher of makeWatchers(definition, watchers)) {
    const exists = store.watchers.find((_watcher) => {
      const samePath = _watcher.path === watcher.path
      const sameHandler = _watcher.signature === watcher.signature
      return samePath && sameHandler
    })
    if (exists) {
      exists.unwatch()
    }
    store.watchers.push(watcher.start())
  }
  return store
}

export const exists = (definition) => {
  const { space, name } = parseDefinition(definition)
  if (name !== undefined) {
    return space in Teddies.spaces && 'stores' in Teddies.spaces[space] && name in Teddies.spaces[space].stores
  } else {
    return space in Teddies.spaces
  }
}

// export const remove = (definition) => {
//   const { space, name } = parseDefinition(definition)
//   const teddy = getTeddy(space)
//   if (name in teddy.stores) delete teddy.stores[name]
// }

// eslint-disable-next-line no-unused-vars
export const reset = (definition) => {
  // const { space, name } = parseDefinition(definition)
  // const teddy = getTeddy(space)
  // for (const _name in teddy.stores) {
  //   remove(definition)
  // }
}

export const run = (definition, actionName, ...args) => {
  const { store } = useStore(definition)
  if (actionName in store.actions) {
    try {
      return store.actions[actionName](...args)
    } catch (error) {
      console.error(`Something went wrong with the action '${actionName}'`)
      console.error(error)
    }
  } else {
    console.warn(`Couldn't find the action '${actionName}' to run.`)
  }
}

export const remove = (definition, path, context) => {
  const { space, name } = parseDefinition(definition)
  const store = getStore({ space, name })
  return accessors.teddyRemove(space, name)(store, path, context)
}

export const has = (definition, path, context) => {
  const store = getStore(definition)
  return accessors.teddyHas(store, path, context)
}

export const get = (definition, path, context, orValue) => {
  const { space, name } = parseDefinition(definition)
  const store = getStore({ space, name })
  return accessors.teddyGet(space, name)(store, path, context) || orValue
}

export const getter = (definition, path, context, orValue) => {
  return function() {
    return get(definition, path, context || this, orValue)
  }
}

export const set = (definition, path, value, context) => {
  const store = getStore(definition)
  accessors.teddySet(store, path, value, context)
}

export const setter = (definition, path, context) => {
  return function(value) {
    set(definition, path, value, context || this)
  }
}

export const sync = (definition, path, context) => {
  const _sync = (path, context) => {
    return {
      get: getter(definition, path, context),
      set: setter(definition, path, context),
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

export const setFeature = (feature = {}) => {
  if (typeof feature.teddy === 'function') {
    feature.teddy(Teddies)
  }
  for (const space of Object.keys(Teddies.spaces || {})) {
    if (typeof feature.space === 'function') {
      feature.space(space)
    }
    for (const name of Object.keys(Teddies.spaces[space].stores || {})) {
      if (typeof feature.store === 'function') {
        feature.store(space, name)
      }
    }
  }
}

export const mapMethods = (mapper = (fn) => fn) => {
  return {
    setStore: mapper(setStore),
    makeState: mapper(makeState),
    setState: mapper(setState),
    applyState: mapper(applyState),
    makeGetters: mapper(makeGetters),
    setGetters: mapper(setGetters),
    makeActions: mapper(makeActions),
    setActions: mapper(setActions),
    makeWatchers: mapper(makeWatchers),
    setWatchers: mapper(setWatchers),
    exists: mapper(exists),
    reset: mapper(reset),
    run: mapper(run),
    remove: mapper(remove),
    has: mapper(has),
    get: mapper(get),
    getter: mapper(getter),
    set: mapper(set),
    setter: mapper(setter),
    sync: mapper(sync),
  }
}

export const getTeddy = (space = DEFAULT_SPACE_NAME) => {
  if (!(space in Teddies.spaces)) Teddies.spaces[space] = {}
  return Teddies.spaces[space]
}

export const useTeddy = (space = DEFAULT_SPACE_NAME) => {
  const store = getTeddy(space)
  const proxy = (fn) => (...fnArgs) => fn({ space, name: DEFAULT_STORE_NAME }, ...fnArgs)
  return { store, ...mapMethods(proxy) }
}

// export const useStore = (name = DEFAULT_STORE_NAME) => {
//   const store = getStore(name)
//   const proxy = (fn) => (...fnArgs) => fn({ name, space: DEFAULT_SPACE_NAME }, ...fnArgs)
//   return { store, ...mapMethods(proxy) }
// }

export const getStore = (definition) => {
  const { space = DEFAULT_SPACE_NAME, name = DEFAULT_STORE_NAME } = parseDefinition(definition)
  getTeddy(space)

  if (!('stores' in Teddies.spaces[space])) {
    Teddies.spaces[space].stores = {}
  }

  if (!(name in Teddies.spaces[space].stores)) {
    Teddies.spaces[space].stores[name] = {
      getters: {},
      actions: {},
      watchers: [],
      options: {},
      features: {},
    }
    applyState({ space, name }, {}, Teddies.spaces[space].stores[name])
  }
  return Teddies.spaces[space].stores[name]
}

export const useStore = (definition) => {
  const store = getStore(definition)
  const proxy = (fn) => (...fnArgs) => fn(definition, ...fnArgs)
  return { store, ...mapMethods(proxy) }
}

// export const provideTeddy = (space = DEFAULT_SPACE_NAME) => {
//   VueCompositionMethods.provide(Teddy, useTeddy(space))
// }

export const provideTeddyStore = (definition) => {
  VueCompositionMethods.provide(TeddyStore, useStore(definition))
}

export const injectTeddy = () => {
  VueCompositionMethods.inject(Teddy)
}

export const injectTeddyStore = () => {
  VueCompositionMethods.inject(TeddyStore)
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
