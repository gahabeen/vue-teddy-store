import { computed, reactive, ref, isRef, watch } from '@vue/composition-api'

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
    this._stores = reactive({})
    this._plugins = reactive({
      cache: CachePlugin,
      history: HistoryPlugin,
      sync: SyncPlugin,
    })
  }

  add(name, store) {
    // eslint-disable-next-line no-unused-vars
    const { _state: A, state: B, methods: C, watchers: D, ...others } = store

    const { _state, state } = TeddyStore.createState(store._state || store.state || {})
    this._stores = {
      ...this._stores,
      [name]: reactive({
        _state,
        state,
        ...(store.methods || {}),
        ...others,
      }),
    }

    const watchers = []
    if (Array.isArray(store.watchers)) {
      watchers.push(...store.watchers)
    } else if (store.watcher) {
      watchers.push(store.watcher)
    }

    for (let watcher of watchers) {
      if (typeof watcher === 'function') {
        watch(this._stores[name].state, watcher, { deep: true })
      } else if (watcher && typeof watcher === 'object' && 'handler' in watcher) {
        const { handler, path, paths = [], ...options } = watcher
        if (path) {
          // console.log("utils.get(this._stores[name].state, path)", utils.get(this._stores[name].state, path));
          watch(() => utils.get(this._stores[name].state, path), handler, { deep: true, ...options })
        } else if (paths.length > 0) {
          watch(
            paths.map((p) => () => utils.get(this._stores[name].state, p)),
            handler,
            { deep: true, ...options }
          )
        } else {
          watch(() => this._stores[name].state, handler, { deep: true, ...options })
        }
      }
    }

    return this
  }

  use(plugin = {}) {
    if (typeof plugin.install === 'function') plugin.install(this)
    if (typeof plugin.handle === 'function') Object.keys(this._stores).map((name) => plugin.handle.call(this, { name, store: this._stores[name] }))
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
    VueInstance.prototype.$Teddy = TeddyStore
    VueInstance.prototype.$teddy = this
  }

  get stores() {
    return this._stores
  }

  static createState(stateObj = {}) {
    const _state = isRef(stateObj) ? stateObj : ref(stateObj)
    /* Until it's made available by Vue 3, be careful with { state } as it can be deeply mutable*/
    // const state = readonly(() => _state.value)
    const state = computed(() => _state.value)
    return { _state, state }
  }

  get(name, path) {
    return TeddyStore.get.call(this, name, path)
  }

  static get(name, path, context) {
    context = context || this
    return function get() {
      const _instance = getInstance(this, context)
      try {
        return utils.get(_instance.stores[name].state, path, undefined, context)
      } catch (error) {
        /* istanbul ignore next */
        throw new Error(`Couldn't compute (get) path '${path}' for '${name}'`)
      }
    }
  }

  set(name, path) {
    return TeddyStore.set.call(this, name, path)
  }

  static set(name, path, context) {
    context = context || this
    return function set(value) {
      const _instance = getInstance(this, context)
      try {
        utils.set(_instance.stores[name]._state, path, value, context)
      } catch (error) {
        /* istanbul ignore next */
        throw new Error(`Couldn't compute (set) path '${path}' for '${name}'`)
      }
    }
  }

  compute(name, path) {
    return TeddyStore.compute.call(this, name, path)
  }

  static compute(name, path) {
    const get = TeddyStore.get.call(this, name, path)
    const set = TeddyStore.set.call(this, name, path)
    return {
      get,
      set,
    }
  }
}
