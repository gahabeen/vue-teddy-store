import * as VueCompositionMethods from '@vue/composition-api'
import { isRef, ref, watch } from '@vue/composition-api'
import { isObject } from 'object-string-path'
import * as accessors from './accessors'
import { Teddies, Teddy, TeddyStore } from './store'
import * as utils from './utils'

const DEFAULT_SPACE_NAME = '$'
const DEFAULT_STORE_NAME = '@'

export const parseDefinition = (spaceOrDefinition = DEFAULT_SPACE_NAME, name = DEFAULT_STORE_NAME) => {
  let _space = spaceOrDefinition
  let _name = name
  if (isObject(spaceOrDefinition)) {
    _space = spaceOrDefinition.space || _space
    _name = spaceOrDefinition.name || _name
  }
  return { space: _space, name: _name }
}

export const setStore = (definition, store) => {
  store = store || {}
  const _store = getTeddyStore(definition)
  setState(definition, store.state)
  setGetters(definition, store.getters)
  setActions(definition, store.actions)
  setWatchers(definition, store.watchers)
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
  const store = getTeddyStore(definition)
  applyState(definition, state, store)
}

export const makeGetters = (definition, getters) => {
  const store = getTeddyStore(definition)
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
  const store = getTeddyStore(definition)
  store.getters = { ...(store.getters || {}), ...makeGetters(definition, getters) }
  return store
}

export const makeActions = (definition, actions) => {
  const store = getTeddyStore(definition)
  actions = actions || {}
  return Object.keys(actions).reduce((acc, key) => {
    if (typeof actions[key] === 'function') {
      acc[key] = (...args) => actions[key](store, ...args)
    }
    return acc
  }, {})
}

export const setActions = (definition, actions) => {
  const store = getTeddyStore(definition)
  store.actions = { ...(store.actions || {}), ...makeActions(definition, actions) }
  return store
}

export const makeWatchers = (definition, watchers) => {
  const { name } = parseDefinition(definition)
  const store = getTeddyStore(definition)

  const _watchers = []
  if (Array.isArray(watchers)) {
    _watchers.push(...watchers)
  } else if (watchers) {
    _watchers.push(watchers)
  }

  // If no watchers
  if (_watchers.length === 0) return []

  return _watchers.reduce((list, watcher) => {
    const register = (path, watching, handler, options) => {
      const unwatch = watch(watching, handler, { deep: true, ...options })
      list.push({
        path,
        handler,
        options,
        unwatch,
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
        register(path, () => accessors.teddyGet(store, path), handler, { deep: true, ...options })
      }
      // Contains paths
      else if (paths.length > 0) {
        register(
          paths.map((p) => utils.resolvePath([name, p])),
          paths.map((p) => () => accessors.teddyGet(store, p)),
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
  const store = getTeddyStore(definition)
  store.watchers = [...(store.watchers || []), ...makeWatchers(definition, watchers)]
  return store
}

export const exists = (definition) => {
  const { space, name } = parseDefinition(definition)
  if (name !== undefined) {
    return space in Teddies.value.spaces && 'stores' in Teddies.value.spaces[space] && name in Teddies.value.spaces[space].stores
  } else {
    return space in Teddies.value.spaces
  }
}

export const remove = (definition) => {
  const { space, name } = parseDefinition(definition)
  const teddy = getTeddy(space)
  if (name in teddy.stores) delete teddy.stores[name]
}

// eslint-disable-next-line no-unused-vars
export const reset = (definition) => {
  // const { space, name } = parseDefinition(definition)
  // const teddy = getTeddy(space)
  // for (const _name in teddy.stores) {
  //   remove(definition)
  // }
}

export const has = (definition, path, context) => {
  const store = getTeddyStore(definition)
  return accessors.teddyHas(store, path, context)
}

export const get = (definition, path, context) => {
  const store = getTeddyStore(definition)
  return accessors.teddyGet(store, path, context)
}

export const getter = (definition, path, context) => {
  return function() {
    return get(definition, path, context || this)
  }
}

export const set = (definition, path, value, context) => {
  const store = getTeddyStore(definition)
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
    remove: mapper(remove),
    reset: mapper(reset),
    has: mapper(has),
    get: mapper(get),
    getter: mapper(getter),
    set: mapper(set),
    setter: mapper(setter),
    sync: mapper(sync),
  }
}

export const getTeddy = (space = DEFAULT_SPACE_NAME) => {
  if (!(space in Teddies.value.spaces)) Teddies.value.spaces[space] = {}
  return Teddies.value.spaces[space]
}

export const useTeddy = (space = DEFAULT_SPACE_NAME) => {
  const store = getTeddy(space)
  const proxy = (fn) => (...fnArgs) => fn({ space, name: DEFAULT_STORE_NAME }, ...fnArgs)
  return { store, ...mapMethods(proxy) }
}

export const getStore = (name = DEFAULT_STORE_NAME) => {
  return getTeddyStore(DEFAULT_SPACE_NAME, name)
}

export const useStore = (name = DEFAULT_STORE_NAME) => {
  const store = getStore(name)
  const proxy = (fn) => (...fnArgs) => fn({ name, space: DEFAULT_SPACE_NAME }, ...fnArgs)
  return { store, ...mapMethods(proxy) }
}

export const getTeddyStore = (spaceOrDefinition, maybeName) => {
  const { space, name } = parseDefinition(spaceOrDefinition, maybeName)
  getTeddy(space)
  if (!('stores' in Teddies.value.spaces[space])) {
    Teddies.value.spaces[space].stores = {}
  }
  if (!(name in Teddies.value.spaces[space].stores)) {
    Teddies.value.spaces[space].stores[name] = {
      getters: {},
      actions: {},
      watchers: [],
      options: {},
    }
    applyState({ space, name }, {}, Teddies.value.spaces[space].stores[name])
  }
  return Teddies.value.spaces[space].stores[name]
}

export const useTeddyStore = (space = DEFAULT_SPACE_NAME, name = DEFAULT_STORE_NAME) => {
  const store = getTeddyStore(space, name)
  const proxy = (fn) => (...fnArgs) => fn({ space, name }, ...fnArgs)
  return { store, ...mapMethods(proxy) }
}

export const provideTeddy = (space = DEFAULT_SPACE_NAME) => {
  VueCompositionMethods.provide(Teddy, useTeddy(space))
}

export const provideTeddyStore = (...args) => {
  VueCompositionMethods.provide(TeddyStore, useTeddyStore(...args))
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
