import { isRef, ref, watch } from './api'
import { isObject } from 'object-string-path'
import * as plugins from './plugins/index'
import * as utils from './utils'
import * as objectAccess from './object-access'
import { computed } from '@vue/composition-api'

function resolveInstance(...instances) {
  return instances.filter(Boolean).reduce((teddy, instance) => {
    if (instance instanceof TeddyStore) {
      return instance
    } else if (isObject(instance) && instance.$teddy instanceof TeddyStore) {
      return instance.$teddy
    } else {
      return teddy
    }
  }, null)
}

function resolveContext(...contexts) {
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

export default class TeddyStore {
  constructor() {
    this._vueInstance = null
    this._stores = {}
    this._plugins = plugins
  }

  add(name, store) {
    const others = utils.omit(store, ['state', 'getters', 'actions', 'watchers'])

    this._stores[name] = {
      state: TeddyStore.createState(store.state),
      ...TeddyStore.createGetters(store.getters),
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
          watch(() => objectAccess.get(this._stores[name].state.value, path), handler, { deep: true, ...options })
        } else if (paths.length > 0) {
          watch(
            paths.map((p) => () => objectAccess.get(this._stores[name].state.value, p)),
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

  remove(name) {
    if (name in this) delete this[name]
    if (name in this._stores) delete this._stores[name]
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

  install(VueInstance) {
    const TeddyInstance = this

    Object.defineProperty(VueInstance.prototype, '$teddy', {
      get() {
        return TeddyInstance.attachTo(this)
      },
      configurable: true,
    })
  }

  get stores() {
    return this._stores
  }

  static createState(state = {}) {
    if (isRef(state)) {
      return state
    } else {
      return ref(state)
    }
  }

  static createGetters(getters) {
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

  /**
   *  has(name, path, context?)
   */
  has(name, path, context) {
    return TeddyStore.has.call(this, name, path, context)
  }

  static has(name, path, context) {
    const globalOrTeddyInstance = this
    return objectAccess.has(resolveInstance(globalOrTeddyInstance, context), utils.resolvePath([`_stores.${name}.state`, path]), resolveContext(context, globalOrTeddyInstance))
  }

  /**
   *  get(name, path, context?)
   */
  get(name, path, context) {
    return TeddyStore.get.call(this, name, path, context)
  }

  static get(name, path, context) {
    const globalOrTeddyInstance = this
    return objectAccess.get(resolveInstance(globalOrTeddyInstance, context), utils.resolvePath([`_stores.${name}.state`, path]), resolveContext(context, globalOrTeddyInstance))
  }

  /**
   *  get(name, path, context?)
   */
  getter(name, path, context) {
    return TeddyStore.getter.call(this, name, path, context)
  }

  static getter(name, path, context) {
    const globalOrTeddyInstance = this
    return function() {
      return TeddyStore.get.call(resolveInstance(this, globalOrTeddyInstance, context), name, path, context || this)
    }
  }

  /**
   *  set(name, path, value, context?)
   */
  set(name, path, value, context) {
    return TeddyStore.set.call(this, name, path, value, context)
  }

  static set(name, path, value, context) {
    const globalOrTeddyInstance = this
    objectAccess.set(resolveInstance(globalOrTeddyInstance, context), utils.resolvePath([`_stores.${name}.state`, path]), value, resolveContext(context, globalOrTeddyInstance))
  }

  /**
   *  setter(name, path, context?)
   */
  setter(name, path, context) {
    return TeddyStore.setter.call(this, name, path, context)
  }

  static setter(name, path, context) {
    const globalOrTeddyInstance = this
    return function(value) {
      TeddyStore.set.call(resolveInstance(this, globalOrTeddyInstance, context), name, path, value, context || this)
    }
  }

  /**
   *  _sync(name, path, context?)
   */
  _sync(name, path, context) {
    return TeddyStore._sync.call(this, name, path, context)
  }

  static _sync(name, path, context) {
    const globalOrTeddyInstance = this
    const get = TeddyStore.getter.call(globalOrTeddyInstance, name, path, context)
    const set = TeddyStore.setter.call(globalOrTeddyInstance, name, path, context)
    return { get, set }
  }

  /**
   *  sync(name, path, context?)
   */
  sync(name, path, context) {
    return TeddyStore.sync.call(this, name, path, context)
  }

  static sync(name, path, context) {
    const globalOrTeddyInstance = this
    const needsToBeComputed = globalOrTeddyInstance == undefined
    const wrap = (compute) => (needsToBeComputed ? computed(compute) : compute)
    // If array, export all sub path as synced properties
    // Tip: use ...sync()
    if (Array.isArray(path)) {
      return path.reduce((acc, prop) => {
        acc[prop] = wrap(TeddyStore._sync.call(globalOrTeddyInstance, name, prop, context))
        return acc
      }, {})
    }
    // If object, export all synced properties path
    // Tip: use ...sync()
    else if (isObject(path)) {
      return Object.keys(path).reduce((acc, key) => {
        acc[key] = wrap(TeddyStore._sync.call(globalOrTeddyInstance, name, path[key], context))
        return acc
      }, {})
    }
    // By default, return the synced property path
    else {
      return wrap(TeddyStore._sync.call(globalOrTeddyInstance, name, path, context))
    }
  }
}

const { get, set, sync, setter, getter, createGetters, createState } = TeddyStore
export { objectAccess, get, set, sync, setter, getter, createGetters, createState }
