/*!
  * vue-teddy-store v0.1.27
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
    if (!key.includes(keys)) {
      acc[key] = obj[key];
    }
    return acc
  }, {})
}

function setProp(obj, key, value) {
  if (isValidKey(key) && (isObject(obj) || Array.isArray(obj))) {
    if (isComputed(obj) && key in obj.value) {
      obj.value[key] = value;
      return obj.value[key]
    } else {
      obj[key] = value;
      return obj[key]
    }
  } else if (obj && key == undefined) {
    if (isComputed(obj)) {
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
    if (isComputed(obj) && key in obj.value) {
      return true
    } else if (key in obj) {
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

function sortContexts(contexts) {
  const instances = contexts.filter((ctx) => ctx && isObject(ctx) && ctx instanceof TeddyStore);
  const hosted = contexts.filter((ctx) => ctx && isObject(ctx) && '$teddy' in ctx && ctx.$teddy instanceof TeddyStore);
  const others = contexts.filter((ctx) => !instances.includes(ctx) && !hosted.includes(ctx));
  return { instances, hosted, others }
}

function getInstance(...contexts) {
  const { instances, hosted } = sortContexts(contexts);
  const choices = [...instances, ...hosted.map((h) => h.$teddy)];
  if (!instances.length === 0) {
    /* istanbul ignore next */
    throw new Error(`Couldn't find any proper instance!`)
  }
  return choices[0]
}

function getContext(...contexts) {
  const { hosted, others } = sortContexts(contexts);
  const choices = [...hosted, ...others];
  if (!choices.length === 0) {
    /* istanbul ignore next */
    throw new Error(`Couldn't find any proper context!`)
  }
  return choices[0]
}

class TeddyStore {
  constructor() {
    this._stores = {};
    this._plugins = plugins;
  }

  add(name, store) {
    const others = omit(store, ['state', 'getters', 'actions', 'watchers']);

    this._stores[name] = {
      ...TeddyStore.createState(store.state),
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
    if (name in this) delete delete this[name];
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

  install(VueInstance) {
    VueInstance.prototype.$teddy = this;
  }

  get stores() {
    return this._stores
  }

  static createState(state) {
    state = state || {};
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

  has(name, path) {
    return TeddyStore.has(name, path, this)
  }

  static has(name, path, context) {
    const _instance = getInstance(this, context);
    const _context = getContext(this, context);
    return has(_instance, `_stores.${name}.state.${path}`, _context)
  }

  get(name, path) {
    return TeddyStore.get(name, path, this)
  }

  static get(name, path, context) {
    const _instance = getInstance(this, context);
    const _context = getContext(this, context);
    return get(_instance, `_stores.${name}.state.${path}`, _context)
  }

  getter(name, path) {
    return TeddyStore.getter(name, path, this)
  }

  static getter(name, path, context) {
    context = context || this;
    return function get() {
      return TeddyStore.get.call(this, name, path, context)
    }
  }

  set(name, path, value) {
    return TeddyStore.set(name, path, value, this)
  }

  static set(name, path, value, context) {
    const _instance = getInstance(this, context);
    const _context = getContext(this, context);
    set(_instance, `_stores.${name}.state.${path}`, value, _context);
  }

  setter(name, path) {
    return TeddyStore.setter(name, path, this)
  }

  static setter(name, path, context) {
    context = context || this;
    return function set(value) {
      TeddyStore.set.call(this, name, path, value, context);
    }
  }

  compute(name, path) {
    return TeddyStore.compute(name, path, this)
  }

  static _compute(name, path, context) {
    context = context || this;
    const get = TeddyStore.getter(name, path, context);
    const set = TeddyStore.setter(name, path, context);
    return { get, set }
  }

  static compute(name, path, context) {
    context = context || this;

    if (isObject(path)) {
      return Object.keys(path).reduce((acc, key) => {
        acc[key] = TeddyStore._compute(name, path[key], context);
        return acc
      }, {})
    } else {
      return TeddyStore._compute(name, path, context)
    }
  }
}

export default TeddyStore;
