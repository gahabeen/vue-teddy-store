import './install/vue-composition-api'
import { computed, watch, ref, isRef } from '@vue/composition-api'

import * as utils from './utils'

import CachePlugin from './plugins/cache'
import HistoryPlugin from './plugins/history'
import SyncPlugin from './plugins/sync'

function getInstance(...solutions) {
  const instanceSolution = solutions.find((s) => s && s instanceof TeddyStore)
  const contextSolution = solutions.find((s) => s && '$teddy' in s && s.$teddy instanceof TeddyStore)
  const solution = instanceSolution || (contextSolution ? contextSolution.$teddy : undefined)
  if (!solution) {
    /* istanbul ignore next */
    throw new Error(`Couldn't find any proper instance!`)
  }
  return solution
}

export default class TeddyStore {
  constructor() {
    this._stores = {}
    this._plugins = {
      cache: CachePlugin,
      history: HistoryPlugin,
      sync: SyncPlugin,
    }
  }

  add(name, store) {
    const others = utils.omit(store, ['state', 'methods', 'watchers'])

    this._stores[name] = {
      state: TeddyStore.createState(store.state),
      ...(store.methods || {}),
      ...others,
    }

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
          watch(() => utils.get(this._stores[name].state.value, path), handler, { deep: true, ...options })
        } else if (paths.length > 0) {
          watch(
            paths.map((p) => () => utils.get(this._stores[name].state.value, p)),
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
    if (isRef(state)) {
      return state
      // } else if (isReactive(state)) {
      //   return toRef(state)
    } else {
      return ref(state)
    }
  }

  get(name, path) {
    return TeddyStore.get(name, path, this)
  }

  static get(name, path, context) {
    context = context || this
    return function get() {
      const _instance = getInstance(this, context)
      return utils.get(_instance, `stores.${name}.value.state.value.${path}`, undefined, context)
    }
  }

  set(name, path) {
    return TeddyStore.set(name, path, this)
  }

  static set(name, path, context) {
    context = context || this
    return function set(value) {
      const _instance = getInstance(this, context)
      utils.set(_instance.stores, `${name}.state.${path}`, value, context)
    }
  }

  compute(name, path) {
    return TeddyStore.compute(name, path, this)
  }

  static compute(name, path, context) {
    context = context || this
    const get = TeddyStore.get(name, path, context)
    const set = TeddyStore.set(name, path, context)
    return computed({ get, set })
  }
}
