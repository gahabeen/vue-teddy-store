import { computed, reactive, watch } from '@vue/composition-api'

import { get, set } from './utils'

import CachePlugin from './plugins/cache'
import HistoryPlugin from './plugins/history'
import SyncedTabsPlugin from './plugins/syncedTabs'

export default class TeddyStore {
  _stores = reactive({})
  _plugins = reactive({
    cache: CachePlugin,
    history: HistoryPlugin,
    SyncedTabs: SyncedTabsPlugin,
  })

  constructor() {}

  // store = { state, methods, watchers }
  add(name, store) {
    this._stores = {
      ...this._stores,
      [name]: reactive({
        _state: store.state || {},
        state: computed(() => this._state),
        ...(store.methods || {}),
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
      } else if (store.watcher && typeof store.watcher === 'object' && 'handler' in store.watcher) {
        const { handler, ...options } = watcher
        watch(this._stores[name].state, handler, { deep: true, ...options })
      }
    }

    return this
  }

  use(plugin = {}) {
    if (typeof plugin.install === 'function') plugin.install(this)
    if (typeof plugin.mapper === 'function') Object.keys(this._stores).map((name) => plugin.mapper.call(this, { name, store: this._store[name] }))
    return this
  }

  /**
   * @example
   * compute("products",  "products.{$route.params.id}.options.{productOptionId}.name")
   */
  compute(name, path) {
    const instance = this
    return {
      get() {
        try {
          return get(get(path, instance._stores[name]), path, undefined, this)
        } catch (error) {
          throw new Error(`Couldn't compute (get) path '${path}' for '${name}'`)
        }
      },
      set(value) {
        try {
          set(get(path, instance._stores[name]).value, path, value, this)
        } catch (error) {
          throw new Error(`Couldn't compute (set) path '${path}' for '${name}'`)
        }
      },
    }
  }

  install() {
    const self = this
    return {
      install: (VueInstance) => {
        VueInstance.prototype.$teddy = self
      },
    }
  }
}
