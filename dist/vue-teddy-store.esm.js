/*!
  * vue-teddy-store v0.1.29
  * (c) 2020 Gabin Desserprit
  * @license MIT
  */
import { watch, reactive, isRef, ref, computed } from '@vue/composition-api';
import { isObject, makeSet, makeHas, makeGet, isValidKey } from 'object-string-path';

const prefix = (name) => `teddy:store:${name}`;
var cache = {
  handle({ name, store }) {
    /* istanbul ignore next */
    const localStorage = window.localStorage || global.localStorage || {};
    /* istanbul ignore next */
    if (localStorage) {
      // Fetched saved state when exists
      const cached = localStorage.getItem(prefix(name));
      if (cached) store.state = { ...store.state, ...JSON.parse(cached) };
      // Watch for mutations, save them
      watch(
        store.state,
        (newState, oldState) => {
          if (newState !== oldState) {
            localStorage.setItem(prefix(name), JSON.stringify(newState));
          }
        },
        { immediate: true, deep: true }
      );
    }
  },
};

var history = {
  handle({ store }) {
    store._history = reactive([]);
    watch(
      store.state,
      (newState) => {
        store._history.push(newState);
      },
      { immediate: true, deep: true }
    );
  },
};

var sync = {
  handle({ name, store }) {
    /* istanbul ignore next */
    if (window) {
      window.addEventListener('storage', (e) => {
        if (e.key === prefix(name)) {
          store.state = reactive({ ...store.state, ...JSON.parse(e.newValue) });
        }
      });
    }
  },
};

var plugins = /*#__PURE__*/Object.freeze({
  __proto__: null,
  cache: cache,
  history: history,
  sync: sync
});

function isComputed(obj) {
  if (!isObject(obj) || (isObject(obj) && !('value' in obj))) {
    return false
  } else {
    const desc = Object.getOwnPropertyDescriptor(obj, 'value');
    return typeof desc.get === 'function' // && typeof desc.set === 'function'
  }
}

function omit(obj, keys = []) {
  return Object.keys(obj).reduce((acc, key) => {
    if (!keys.includes(key)) {
      acc[key] = obj[key];
    }
    return acc
  }, {})
}

function resolvePath(arr) {
  return arr.filter(Boolean).filter((item) => item.length > 0).join('.')
}

function setProp(obj, key, value) {
  if (isValidKey(key) && (isObject(obj) || Array.isArray(obj))) {
    if (isComputed(obj) && 'value' in obj && key in obj.value) {
      obj.value[key] = value;
      return obj.value[key]
    } else {
      obj[key] = value;
      return obj[key]
    }
  } else if (obj && key == undefined) {
    if (isComputed(obj) && 'value' in obj) {
      obj.value = value;
    } else if (isObject(value)) {
      Object.assign(obj, value);
    } else {
      obj = value;
    }
    return obj
  } else {
    console.log(`Couldn't not set ${key}`);
    return
  }
}

function getProp(obj, key) {
  if (isValidKey(key)) {
    if (isComputed(obj)) {
      if (key in obj.value) {
        return obj.value[key]
      } else {
        return obj.value
      }
    } else if (isObject(obj) || Array.isArray(obj)) {
      return obj[key]
    }
  } else if (obj && key === undefined) {
    if (isComputed(obj)) {
      return obj.value
    } else {
      return obj
    }
  } else {
    return // error
  }
}

function hasProp(obj, key) {
  if (!isObject(obj) && !Array.isArray(obj)) {
    return false
  } else if (isValidKey(key)) {
    // Test if computed AND if key we're looking for is in .value,
    // if not continue to check if we're not looking for the key "value" maybe
    if (isComputed(obj) && obj.value && key in obj.value) {
      return true
    } else if (obj && key in obj) {
      return true
    }
  } else {
    return false
  }
}

const set = makeSet({
  setProp,
  getProp,
  hasProp,
});

const has = makeHas({
  getProp,
  hasProp,
});

const get = makeGet({
  getProp,
  hasProp,
});

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

class TeddyStore {
  constructor() {
    this._vueInstance = null;
    this._stores = {};
    this._plugins = plugins;
  }

  add(name, store) {
    const others = omit(store, ['state', 'getters', 'actions', 'watchers']);

    this._stores[name] = {
      state: TeddyStore.createState(store.state),
      ...TeddyStore.createGetters(store.getters),
      ...(store.actions || {}),
      ...others,
    };

    this[name] = this._stores[name];

    const watchers = [];
    if (Array.isArray(store.watchers)) {
      watchers.push(...store.watchers);
    } else if (store.watcher) {
      watchers.push(store.watcher);
    }

    for (let watcher of watchers) {
      if (typeof watcher === 'function') {
        watch(() => this._stores[name].state.value, watcher, { deep: true });
      } else if (watcher && typeof watcher === 'object' && 'handler' in watcher) {
        const { handler, path, paths = [], ...options } = watcher;
        if (path) {
          watch(() => get(this._stores[name].state.value, path), handler, { deep: true, ...options });
        } else if (paths.length > 0) {
          watch(
            paths.map((p) => () => get(this._stores[name].state.value, p)),
            handler,
            { deep: true, ...options }
          );
        } else {
          watch(() => this._stores[name].state.value, handler, { deep: true, ...options });
        }
      }
    }

    return this
  }

  remove(name) {
    if (name in this) delete this[name];
    if (name in this._stores) delete this._stores[name];
  }

  use(plugin = {}) {
    if (typeof plugin.install === 'function') {
      plugin.install(this);
    }
    if (typeof plugin.handle === 'function') {
      Object.keys(this._stores).map((name) => plugin.handle.call(this, { name, store: this._stores[name] }));
    }
    return this
  }

  activate(pluginNames = []) {
    if (!Array.isArray(pluginNames)) pluginNames = [pluginNames];
    for (let pluginName of pluginNames) {
      if (pluginName in this._plugins) {
        this.use(this._plugins[pluginName]);
      }
    }
    return this
  }

  attachTo(VueInstance) {
    this._vueInstance = VueInstance;
    return this
  }

  install(VueInstance) {
    const TeddyInstance = this;

    Object.defineProperty(VueInstance.prototype, '$teddy', {
      get() {
        return TeddyInstance.attachTo(this)
      },
      configurable: true,
    });
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
    getters = getters || {};
    return Object.keys(getters).reduce((acc, key) => {
      if (isComputed(getters[key])) {
        acc[key] = getters[key];
      } else if (typeof getters[key] === 'function') {
        acc[key] = computed(getters[key]);
      }
      return acc
    }, {})
  }

  has(name, path, context) {
    return TeddyStore.has.call(this, name, path, context)
  }

  static has(name, path, context) {
    const teddyInstance = this;
    context = context || teddyInstance._vueInstance;
    return has(resolveInstance(teddyInstance, context), resolvePath([`_stores.${name}.state`, path]), context)
  }

  get(name, path, context) {
    return TeddyStore.get.call(this, name, path, context)
  }

  static get(name, path, context) {
    const teddyInstance = this;
    context = context || teddyInstance._vueInstance;
    return get(resolveInstance(teddyInstance, context), resolvePath([`_stores.${name}.state`, path]), context)
  }

  getter(name, path, context) {
    return TeddyStore.getter.call(this, name, path, context)
  }

  static getter(name, path, context) {
    const teddyInstance = this;
    return function() {
      return TeddyStore.get.call(resolveInstance(this, teddyInstance, context), name, path, context || this)
    }
  }

  set(name, path, value, context) {
    return TeddyStore.set.call(this, name, path, value, context)
  }

  static set(name, path, value, context) {
    const teddyInstance = this;
    context = context || teddyInstance._vueInstance;
    set(resolveInstance(teddyInstance, context), resolvePath([`_stores.${name}.state`, path]), value, context);
  }

  setter(name, path, context) {
    return TeddyStore.setter.call(this, name, path, context)
  }

  static setter(name, path, context) {
    const teddyInstance = this;
    return function(value) {
      return TeddyStore.set.call(resolveInstance(this, teddyInstance, context), name, path, value, context || this)
    }
  }

  _sync(name, path) {
    return TeddyStore._sync.call(this, name, path)
  }

  static _sync(name, path, context) {
    const teddyInstance = this;
    const get = TeddyStore.getter.call(teddyInstance, name, path, context);
    const set = TeddyStore.setter.call(teddyInstance, name, path, context);
    return { get, set }
  }

  sync(name, path, context) {
    return TeddyStore.sync.call(this, name, path, context)
  }

  static sync(name, path, context) {
    const teddyInstance = this;
    // If array, export all sub path as synced properties
    // Tip: use ...sync()
    if (Array.isArray(path)) {
      return path.reduce((acc, prop) => {
        acc[prop] = TeddyStore._sync.call(teddyInstance, name, prop, context);
        return acc
      }, {})
    }
    // If object, export all synced properties path
    // Tip: use ...sync()
    else if (isObject(path)) {
      return Object.keys(path).reduce((acc, key) => {
        acc[key] = TeddyStore._sync.call(teddyInstance, name, path[key], context);
        return acc
      }, {})
    }
    // By default, return the synced property path
    else {
      return TeddyStore._sync.call(teddyInstance, name, path, context)
    }
  }
}

export default TeddyStore;
