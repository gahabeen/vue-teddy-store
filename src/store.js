import * as VueCompositionMethods from '@vue/composition-api'
import { isRef, ref, watch } from '@vue/composition-api'
import { isObject } from 'object-string-path'
import * as accessors from './accessors'
import * as features from './features/index'
import * as utils from './utils'
// import { registerForDevtools } from './devtools'
import __Vue from 'vue'

let Vue // binding to Vue

export class MissingStoreError extends Error {
  constructor(message) {
    super(message)
    this.name = 'MissingStoreError'
  }
}

export default class TeddyStore {
  constructor(options) {
    this._options = {
      devtools: __Vue.config.devtools,
      ...(options || {}),
    }
    this._vueInstance = null
    this._stores = {}
    this._features = features

    // Add default store
    // this.add('@', { state: {} })
  }

  add(name, store) {
    store = store || {}

    this._stores[name] = {}
    this[name] = this._stores[name]

    this.addState(name, store.state)
    this.addGetters(name, store.getters)
    this.addActions(name, store.actions)
    this.addStoreProperties(name, utils.omit(store, ['state', 'getters', 'actions', 'watcher', 'watchers', 'devtools']))
    this.registerWatchers(name, store.watcher)
    this.registerWatchers(name, store.watchers)
    // if (store.devtools || this._options.devtools) {
    //   this.registerForDevtools(name)
    // }

    return this
  }

  addStoreProperties(name, properties, options) {
    const { allowOverriding = false, alsoAtPath = null } = options || {}
    if (!this._stores[name]) this._stores[name] = {}
    for (const propertyKey of Object.keys(properties || {})) {
      if (propertyKey in this._stores[name] && !allowOverriding) {
        console.warn(`addStoreProperties('${name}',...) - Couldn't override property ${propertyKey} on store '${name}'`)
        continue
      }
      this._stores[name][propertyKey] = properties[propertyKey]
      if (typeof alsoAtPath === 'string') {
        if (!this._stores[name][alsoAtPath]) this._stores[name][alsoAtPath] = {}
        this._stores[name][alsoAtPath][propertyKey] = this._stores[name][propertyKey]
      }
    }

    return this
  }

  addState(name, state) {
    if (!this._stores[name]) this._stores[name] = {}
    const _state = createState(state)
    this._stores[name]._state = _state

    Object.defineProperty(this._stores[name], 'state', {
      get: () => _state.value,
      set: (newState) => {
        _state.value = newState
      },
      enumerable: true,
    })

    return this
  }

  addGetters(name, getters) {
    this.addStoreProperties(name, createGetters(this._stores[name], getters), { alsoAtPath: '_getters' })
    return this
  }

  addActions(name, actions) {
    this.addStoreProperties(name, createActions(this._stores[name], actions), { alsoAtPath: '_actions' })
    return this
  }

  registerWatchers(name, watchers) {
    const _watchers = []
    if (Array.isArray(watchers)) {
      _watchers.push(...watchers)
    } else if (watchers) {
      _watchers.push(watchers)
    }

    // If no store is registered at this name yet
    if (!this.exists(name)) return
    // If no watchers
    if (_watchers.length === 0) return

    for (let watcher of _watchers) {
      // Watcher is a function
      if (typeof watcher === 'function') {
        watch(() => this._stores[name].state, watcher, { deep: true })
      }
      // Watcher is an object definition with a .handler()
      else if (watcher && typeof watcher === 'object' && 'handler' in watcher) {
        const { handler, path, paths = [], ...options } = watcher
        // Contains a path
        if (typeof path === 'string') {
          watch(() => accessors.makeTeddyGet()(this, utils.resolvePath([name, path])), handler, { deep: true, ...options })
        }
        // Contains paths
        else if (paths.length > 0) {
          watch(
            paths.map((p) => () => accessors.makeTeddyGet()(this, utils.resolvePath([name, p]))),
            handler,
            { deep: true, ...options }
          )
        }
        // Global watcher
        else {
          watch(() => this._stores[name].state, handler, { deep: true, ...options })
        }
      }
    }

    return this
  }

  // registerForDevtools(name) {
  //   const { watchers } = registerForDevtools(this._stores[name])
  //   this.registerWatchers(name, watchers)
  // }

  exists(name) {
    return name in this._stores
  }

  remove(name) {
    if (name in this) delete this[name]
    if (name in this._stores) delete this._stores[name]
  }

  reset() {
    for (let store in this._stores) {
      this.remove(store)
    }
  }

  use(feature = {}) {
    if (typeof feature.install === 'function') {
      feature.install(this)
    }
    if (typeof feature.handle === 'function') {
      Object.keys(this._stores).map((name) => feature.handle.call(this, { name, store: this._stores[name] }))
    }
    return this
  }

  activate(featureNames = []) {
    if (!Array.isArray(featureNames)) featureNames = [featureNames]
    for (let featureName of featureNames) {
      if (featureName in this._features) {
        this.use(this._features[featureName])
      }
    }
    return this
  }

  attachTo(VueInstance) {
    this._vueInstance = VueInstance
    return this
  }

  install(...args) {
    const TeddyInstance = this
    const [VueInstance] = args

    // Vue 2
    if (VueInstance.version.startsWith('2')) {
      /* istanbul ignore next */
      if (Vue && VueInstance === Vue) {
        return
      }

      Vue = VueInstance

      VueInstance.prototype.$teddy = TeddyInstance

      // Doesn't bring anything more
      // Object.defineProperty(VueInstance.prototype, '$teddy', {
      //   get() {
      //     return TeddyInstance.attachTo(this)
      //   },
      //   enumerable: true,
      //   configurable: true,
      // })
    }
    // Vue 3
    /* istanbul ignore next */
    else if (VueInstance.version.startsWith('3')) {
      const [app] = args

      app.provide('$teddy')

      Object.defineProperty(app.config.globalProperties, '$teddy', {
        get() {
          return TeddyInstance.attachTo(this)
        },
        configurable: true,
      })
    }
  }

  get stores() {
    return this._stores
  }

  has(path, context) {
    return has(path, context)
  }

  get(path, context) {
    return get(path, context)
  }

  getter(path, context) {
    return getter(path, context)
  }

  set(path, value, context) {
    return set(path, value, context)
  }

  setter(path, context) {
    return setter(path, context)
  }

  sync(path, context) {
    return sync(path, context)
  }

  computed(definition) {
    return computed(definition)
  }
}

export const createState = (state = {}) => {
  if (isRef(state)) {
    return state
  } else {
    return ref(state)
  }
}

export const createGetters = (store, getters) => {
  getters = getters || {}
  return Object.keys(getters).reduce((acc, key) => {
    if (utils.isComputed(getters[key])) {
      acc[key] = getters[key]
    } else if (typeof getters[key] === 'function') {
      const context = { state: store.state, getters: store.getters }
      acc[key] = computed(() => getters[key](context))
    }
    return acc
  }, {})
}

export const createActions = (store, actions) => {
  actions = actions || {}
  return Object.keys(actions).reduce((acc, key) => {
    if (typeof actions[key] === 'function') {
      const context = { state: store.state, getters: store.getters }
      acc[key] = (...args) => actions[key](context, ...args)
    }
    return acc
  }, {})
}

export const has = (path, context) => {
  const teddy = Vue.prototype.$teddy
  const _has = accessors.makeTeddyHas((name) => {
    if (!teddy.exists(name)) {
      throw new MissingStoreError(`You're trying to use the method .has('${path}', context?) on a store which doesn't exists: '${name}'`)
    }
  })
  return _has(teddy, path, context)
}

export const get = (path, context) => {
  const teddy = Vue.prototype.$teddy
  const _get = accessors.makeTeddyGet((name) => {
    if (!teddy.exists(name)) {
      throw new MissingStoreError(`You're trying to use the method .get('${path}', context?) on a store which doesn't exists: '${name}'`)
    }
  })
  return _get(teddy, path, context)
}

export const set = (path, value, context) => {
  const teddy = Vue.prototype.$teddy
  const _set = accessors.makeTeddySet((name) => {
    if (!teddy.exists(name)) {
      throw new MissingStoreError(`You're trying to use the method .set('${path}', value, context?) on a store which doesn't exists: '${name}'`)
    }
  })
  _set(teddy, path, value, context)
}

export const getter = (path, context) => {
  return function() {
    return get(path, context || this)
  }
}

export const setter = (path, context) => {
  return function(value) {
    set(path, value, context || this)
  }
}

export const sync = (path, context) => {
  const _sync = (path, context) => {
    return {
      get: getter(path, context),
      set: setter(path, context),
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

// Is too random as it doesn't keep current instance but rather last instance where $teddy
// has been called from
// export function resolveContext(...contexts) {
//   for (let context of contexts.filter(Boolean)) {
//     if (context instanceof TeddyStore && context._vueInstance) {
//       return context._vueInstance
//     } else if (isObject(context)) {
//       return context
//     }
//   }
// }
