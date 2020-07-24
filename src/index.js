import { isRef, ref, watch } from './api'
import { isObject } from 'object-string-path'
import * as plugins from './plugins/index'
import * as utils from './utils'
import * as objectAccess from './object-access'
import { computed } from '@vue/composition-api'

function sortContexts(contexts) {
  const instances = contexts.filter((ctx) => ctx && isObject(ctx) && ctx instanceof TeddyStore)
  const hosted = contexts.filter((ctx) => ctx && isObject(ctx) && '$teddy' in ctx && ctx.$teddy instanceof TeddyStore)
  const others = contexts.filter((ctx) => !instances.includes(ctx) && !hosted.includes(ctx))
  return { instances, hosted, others }
}

function getInstance(...contexts) {
  const { instances, hosted } = sortContexts(contexts)
  const choices = [...instances, ...hosted.map((h) => h.$teddy)]
  if (!instances.length === 0) {
    /* istanbul ignore next */
    throw new Error(`Couldn't find any proper instance!`)
  }
  return choices[0]
}

function getContext(...contexts) {
  const { hosted, others } = sortContexts(contexts)
  const choices = [...hosted, ...others]
  if (!choices.length === 0) {
    /* istanbul ignore next */
    throw new Error(`Couldn't find any proper context!`)
  }
  return choices[0]
}

export default class TeddyStore {
  constructor() {
    this._stores = {}
    this._plugins = plugins
  }

  add(name, store) {
    const others = utils.omit(store, ['state', 'getters', 'actions', 'watchers'])

    this._stores[name] = {
      ...TeddyStore.createState(store.state),
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
    if (name in this) delete delete this[name]
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

  install(VueInstance) {
    VueInstance.prototype.$teddy = this
  }

  get stores() {
    return this._stores
  }

  static createState(state) {
    state = state || {}
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

  has(name, path) {
    return TeddyStore.has(name, path, this)
  }

  static has(name, path, context) {
    const _instance = getInstance(this, context)
    const _context = getContext(this, context)
    return objectAccess.has(_instance, `_stores.${name}.state.${path}`, _context)
  }

  get(name, path) {
    return TeddyStore.get(name, path, this)
  }

  static get(name, path, context) {
    const _instance = getInstance(this, context)
    const _context = getContext(this, context)
    return objectAccess.get(_instance, `_stores.${name}.state.${path}`, _context)
  }

  getter(name, path) {
    return TeddyStore.getter(name, path, this)
  }

  static getter(name, path, context) {
    context = context || this
    return function get() {
      return TeddyStore.get.call(this, name, path, context)
    }
  }

  set(name, path, value) {
    return TeddyStore.set(name, path, value, this)
  }

  static set(name, path, value, context) {
    const _instance = getInstance(this, context)
    const _context = getContext(this, context)
    objectAccess.set(_instance, `_stores.${name}.state.${path}`, value, _context)
  }

  setter(name, path) {
    return TeddyStore.setter(name, path, this)
  }

  static setter(name, path, context) {
    context = context || this
    return function set(value) {
      TeddyStore.set.call(this, name, path, value, context)
    }
  }

  compute(name, path) {
    return TeddyStore.compute(name, path, this)
  }

  static _compute(name, path, context) {
    context = context || this
    const get = TeddyStore.getter(name, path, context)
    const set = TeddyStore.setter(name, path, context)
    return { get, set }
  }

  static compute(name, path, context) {
    context = context || this

    if (isObject(path)) {
      return Object.keys(path).reduce((acc, key) => {
        acc[key] = TeddyStore._compute(name, path[key], context)
        return acc
      }, {})
    } else {
      return TeddyStore._compute(name, path, context)
    }
  }
}
