import * as VueCompositionMethods from '@vue/composition-api'
import { isObject } from 'object-string-path'
import { isRef, ref, watch } from './api'
import * as objectAccess from './object-access'
import * as plugins from './plugins/index'
import * as utils from './utils'

let Vue // binding to Vue

export class MissingStoreError extends Error {
  constructor(message) {
    super(message)
    this.name = 'MissingStoreError'
  }
}

export default class TeddyStore {
  constructor() {
    this._vueInstance = null
    this._stores = {}
    this._plugins = plugins

    // Add default store
    this.add('@', { state: {} })
  }

  add(name, store) {
    store = store || {}
    const others = utils.omit(store, ['state', 'getters', 'actions', 'watchers'])

    this._stores[name] = {
      state: createState(store.state),
      ...createGetters(store.getters),
      ...(store.actions || {}),
      ...others,
    }

    this[name] = this._stores[name]

    const watchers = []
    if (Array.isArray(store.watchers)) {
      watchers.push(...store.watchers)
    } else if (store.watcher) {
      watchers.push(store.watcher)
    }

    for (let watcher of watchers) {
      if (typeof watcher === 'function') {
        watch(() => this._stores[name].state.value, watcher, { deep: true })
      } else if (watcher && typeof watcher === 'object' && 'handler' in watcher) {
        const { handler, path, paths = [], ...options } = watcher
        if (path) {
          watch(() => objectAccess.makeTeddyGet()(this, utils.resolvePath([name, path])), handler, { deep: true, ...options })
        } else if (paths.length > 0) {
          watch(
            paths.map((p) => () => objectAccess.makeTeddyGet()(this, utils.resolvePath([name, p]))),
            handler,
            { deep: true, ...options }
          )
        } else {
          watch(() => this._stores[name].state.value, handler, { deep: true, ...options })
        }
      }
    }

    return this
  }

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

  use(plugin = {}) {
    if (typeof plugin.install === 'function') {
      plugin.install(this)
    }
    if (typeof plugin.handle === 'function') {
      Object.keys(this._stores).map((name) => plugin.handle.call(this, { name, store: this._stores[name] }))
    }
    return this
  }

  activate(pluginNames = []) {
    if (!Array.isArray(pluginNames)) pluginNames = [pluginNames]
    for (let pluginName of pluginNames) {
      if (pluginName in this._plugins) {
        this.use(this._plugins[pluginName])
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

      Object.defineProperty(VueInstance.prototype, '$teddy', {
        get() {
          return TeddyInstance.attachTo(this)
        },
        configurable: true,
      })
    }
    // Vue 3
    /* istanbul ignore next */
    else if (VueInstance.version.startsWith('3')) {
      const [app, options] = args

      app.provide('teddy', options)
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

export const createGetters = (getters) => {
  getters = getters || {}
  return Object.keys(getters).reduce((acc, key) => {
    if (utils.isComputed(getters[key])) {
      acc[key] = getters[key]
    } else if (typeof getters[key] === 'function') {
      acc[key] = computed(getters[key])
    }
    return acc
  }, {})
}

export const has = (path, context) => {
  const teddy = Vue.prototype.$teddy
  const _has = objectAccess.makeTeddyHas((name) => {
    if (!teddy.exists(name)) {
      throw new MissingStoreError(`You're trying to use the method .has('${path}', context?) on a store which doesn't exists: '${name}'`)
    }
  })
  return _has(teddy, path, resolveContext(context, teddy))
}

export const get = (path, context) => {
  const teddy = Vue.prototype.$teddy
  const _get = objectAccess.makeTeddyGet((name) => {
    if (!teddy.exists(name)) {
      throw new MissingStoreError(`You're trying to use the method .get('${path}', context?) on a store which doesn't exists: '${name}'`)
    }
  })
  return _get(teddy, path, resolveContext(context, teddy))
}

export const set = (path, value, context) => {
  const teddy = Vue.prototype.$teddy
  const _set = objectAccess.makeTeddySet((name) => {
    if (!teddy.exists(name)) {
      throw new MissingStoreError(`You're trying to use the method .set('${path}', value, context?) on a store which doesn't exists: '${name}'`)
    }
  })
  _set(teddy, path, value, resolveContext(context, teddy))
}

export const getter = (path, context) => {
  return function() {
    return get(path, context)
  }
}

export const setter = (path, context) => {
  return function(value) {
    set(path, value, context)
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

export function resolveContext(...contexts) {
  return contexts.filter(Boolean).reduce((data, context) => {
    if (context instanceof TeddyStore && context._vueInstance) {
      return context._vueInstance
    } else if (isObject(context)) {
      return context
    } else {
      return data
    }
  }, {})
}
