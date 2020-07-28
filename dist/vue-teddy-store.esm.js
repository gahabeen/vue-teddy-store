/*!
  * vue-teddy-store v0.1.35
  * (c) 2020 Gabin Desserprit
  * @license MIT
  */
import { isObject, makeGet, isValidKey, makeSet, makeHas } from 'object-string-path';
import { watch, reactive, isRef, ref, computed as computed$2 } from '@vue/composition-api';
import __Vue from 'vue';

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
  return arr
    .filter(Boolean)
    .filter((item) => item.length > 0)
    .join('.')
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

function afterGetSteps(storeNameHook) {
  return (steps) => {
    const [name, ..._steps] = steps || [];
    if (!name) return []
    storeNameHook(name);
    return ['_stores', name, 'state', ..._steps]
  }
}

const makeTeddySet = (storeNameHook = (name) => name) =>
  makeSet({
    setProp,
    getProp,
    hasProp,
    afterGetSteps: afterGetSteps(storeNameHook),
  });

const makeTeddyHas = (storeNameHook = (name) => name) => {
  return makeHas({
    getProp,
    hasProp,
    afterGetSteps: afterGetSteps(storeNameHook),
  })
};

const makeTeddyGet = (storeNameHook = (name) => name) =>
  makeGet({
    getProp,
    hasProp,
    afterGetSteps: afterGetSteps(storeNameHook),
  });

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

var accessors = /*#__PURE__*/Object.freeze({
  __proto__: null,
  makeTeddySet: makeTeddySet,
  makeTeddyHas: makeTeddyHas,
  makeTeddyGet: makeTeddyGet,
  set: set,
  has: has,
  get: get
});

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
        () => store.state,
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
          store.state = { ...store.state, ...JSON.parse(e.newValue) };
        }
      });
    }
  },
};

var features = /*#__PURE__*/Object.freeze({
  __proto__: null,
  cache: cache,
  history: history,
  sync: sync
});

let Vue; // binding to Vue

class MissingStoreError extends Error {
  constructor(message) {
    super(message);
    this.name = 'MissingStoreError';
  }
}

class TeddyStore {
  constructor(options) {
    this._options = {
      devtools: __Vue.config.devtools,
      ...(options || {}),
    };
    this._vueInstance = null;
    this._stores = {};
    this._features = features;

    // Add default store
    // this.add('@', { state: {} })
  }

  add(name, store) {
    store = store || {};

    this._stores[name] = {};
    this[name] = this._stores[name];

    this.addState(name, store.state);
    this.addGetters(name, store.getters);
    this.addActions(name, store.actions);
    this.addStoreProperties(name, omit(store, ['state', 'getters', 'actions', 'watcher', 'watchers', 'devtools']));
    this.registerWatchers(name, store.watcher);
    this.registerWatchers(name, store.watchers);
    // if (store.devtools || this._options.devtools) {
    //   this.registerForDevtools(name)
    // }

    return this
  }

  addStoreProperties(name, properties, options) {
    const { allowOverriding = false, alsoAtPath = null } = options || {};
    if (!this._stores[name]) this._stores[name] = {};
    for (const propertyKey of Object.keys(properties || {})) {
      if (propertyKey in this._stores[name] && !allowOverriding) {
        console.warn(`addStoreProperties('${name}',...) - Couldn't override property ${propertyKey} on store '${name}'`);
        continue
      }
      this._stores[name][propertyKey] = properties[propertyKey];
      if (typeof alsoAtPath === 'string') {
        if (!this._stores[name][alsoAtPath]) this._stores[name][alsoAtPath] = {};
        this._stores[name][alsoAtPath][propertyKey] = this._stores[name][propertyKey];
      }
    }

    return this
  }

  addState(name, state) {
    if (!this._stores[name]) this._stores[name] = {};
    const _state = createState(state);
    this._stores[name]._state = _state;

    Object.defineProperty(this._stores[name], 'state', {
      get: () => _state.value,
      set: (newState) => {
        _state.value = newState;
      },
      enumerable: true,
    });

    return this
  }

  addGetters(name, getters) {
    this.addStoreProperties(name, createGetters(this._stores[name], getters), { alsoAtPath: '_getters' });
    return this
  }

  addActions(name, actions) {
    this.addStoreProperties(name, createActions(this._stores[name], actions), { alsoAtPath: '_actions' });
    return this
  }

  registerWatchers(name, watchers) {
    const _watchers = [];
    if (Array.isArray(watchers)) {
      _watchers.push(...watchers);
    } else if (watchers) {
      _watchers.push(watchers);
    }

    // If no store is registered at this name yet
    if (!this.exists(name)) return
    // If no watchers
    if (_watchers.length === 0) return

    for (let watcher of _watchers) {
      // Watcher is a function
      if (typeof watcher === 'function') {
        watch(() => this._stores[name].state, watcher, { deep: true });
      }
      // Watcher is an object definition with a .handler()
      else if (watcher && typeof watcher === 'object' && 'handler' in watcher) {
        const { handler, path, paths = [], ...options } = watcher;
        // Contains a path
        if (typeof path === 'string') {
          watch(() => makeTeddyGet()(this, resolvePath([name, path])), handler, { deep: true, ...options });
        }
        // Contains paths
        else if (paths.length > 0) {
          watch(
            paths.map((p) => () => makeTeddyGet()(this, resolvePath([name, p]))),
            handler,
            { deep: true, ...options }
          );
        }
        // Global watcher
        else {
          watch(() => this._stores[name].state, handler, { deep: true, ...options });
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
    if (name in this) delete this[name];
    if (name in this._stores) delete this._stores[name];
  }

  reset() {
    for (let store in this._stores) {
      this.remove(store);
    }
  }

  use(feature = {}) {
    if (typeof feature.install === 'function') {
      feature.install(this);
    }
    if (typeof feature.handle === 'function') {
      Object.keys(this._stores).map((name) => feature.handle.call(this, { name, store: this._stores[name] }));
    }
    return this
  }

  activate(featureNames = []) {
    if (!Array.isArray(featureNames)) featureNames = [featureNames];
    for (let featureName of featureNames) {
      if (featureName in this._features) {
        this.use(this._features[featureName]);
      }
    }
    return this
  }

  attachTo(VueInstance) {
    this._vueInstance = VueInstance;
    return this
  }

  install(...args) {
    const TeddyInstance = this;
    const [VueInstance] = args;

    // Vue 2
    if (VueInstance.version.startsWith('2')) {
      /* istanbul ignore next */
      if (Vue && VueInstance === Vue) {
        return
      }

      Vue = VueInstance;

      VueInstance.prototype.$teddy = TeddyInstance;

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
      const [app] = args;

      app.provide('$teddy');

      Object.defineProperty(app.config.globalProperties, '$teddy', {
        get() {
          return TeddyInstance.attachTo(this)
        },
        configurable: true,
      });
    }
  }

  get stores() {
    return this._stores
  }

  has(path, context) {
    return has$1(path, context)
  }

  get(path, context) {
    return get$1(path, context)
  }

  getter(path, context) {
    return getter(path, context)
  }

  set(path, value, context) {
    return set$1(path, value, context)
  }

  setter(path, context) {
    return setter(path, context)
  }

  sync(path, context) {
    return sync$1(path, context)
  }

  computed(definition) {
    return computed(definition)
  }
}

const createState = (state = {}) => {
  if (isRef(state)) {
    return state
  } else {
    return ref(state)
  }
};

const createGetters = (store, getters) => {
  getters = getters || {};
  return Object.keys(getters).reduce((acc, key) => {
    if (isComputed(getters[key])) {
      acc[key] = getters[key];
    } else if (typeof getters[key] === 'function') {
      const context = { state: store.state, getters: store.getters };
      acc[key] = computed(() => getters[key](context));
    }
    return acc
  }, {})
};

const createActions = (store, actions) => {
  actions = actions || {};
  return Object.keys(actions).reduce((acc, key) => {
    if (typeof actions[key] === 'function') {
      const context = { state: store.state, getters: store.getters };
      acc[key] = (...args) => actions[key](context, ...args);
    }
    return acc
  }, {})
};

const has$1 = (path, context) => {
  const teddy = Vue.prototype.$teddy;
  const _has = makeTeddyHas((name) => {
    if (!teddy.exists(name)) {
      throw new MissingStoreError(`You're trying to use the method .has('${path}', context?) on a store which doesn't exists: '${name}'`)
    }
  });
  return _has(teddy, path, context) //resolveContext(context, teddy))
};

const get$1 = (path, context) => {
  const teddy = Vue.prototype.$teddy;
  const _get = makeTeddyGet((name) => {
    if (!teddy.exists(name)) {
      throw new MissingStoreError(`You're trying to use the method .get('${path}', context?) on a store which doesn't exists: '${name}'`)
    }
  });
  return _get(teddy, path, context) //resolveContext(context, teddy))
};

const set$1 = (path, value, context) => {
  const teddy = Vue.prototype.$teddy;
  const _set = makeTeddySet((name) => {
    if (!teddy.exists(name)) {
      throw new MissingStoreError(`You're trying to use the method .set('${path}', value, context?) on a store which doesn't exists: '${name}'`)
    }
  });
  _set(teddy, path, value, context); //resolveContext(context, teddy))
};

const getter = (path, context) => {
  return function() {
    return get$1(path, context || this)
  }
};

const setter = (path, context) => {
  return function(value) {
    set$1(path, value, context || this);
  }
};

const sync$1 = (path, context) => {
  const _sync = (path, context) => {
    return {
      get: getter(path, context),
      set: setter(path, context),
    }
  };

  // If array, export all sub path as synced properties
  // Tip: use ...sync()
  if (Array.isArray(path)) {
    return path.reduce((acc, prop) => {
      acc[prop] = _sync(prop, context);
      return acc
    }, {})
  }
  // If object, export all synced properties path
  // Tip: use ...sync()
  else if (isObject(path)) {
    return Object.keys(path).reduce((acc, key) => {
      acc[key] = _sync(path[key], context);
      return acc
    }, {})
  }
  // By default, return the synced property path
  else {
    return _sync(path, context)
  }
};

const computed = (definition) => {
  if (isObject(definition)) {
    const hasGetter = 'get' in definition && typeof definition.get === 'function';
    const hasSetter = 'set' in definition && typeof definition.set === 'function';
    if (hasGetter || hasSetter) {
      return computed$2(definition)
    } else {
      return Object.keys(definition).reduce((acc, key) => {
        acc[key] = computed$2(definition[key]);
        return acc
      }, {})
    }
  } else {
    return computed$2(definition)
  }
};

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

var others = /*#__PURE__*/Object.freeze({
  __proto__: null,
  MissingStoreError: MissingStoreError,
  'default': TeddyStore,
  createState: createState,
  createGetters: createGetters,
  createActions: createActions,
  has: has$1,
  get: get$1,
  set: set$1,
  getter: getter,
  setter: setter,
  sync: sync$1,
  computed: computed
});

const { has: has$2, get: get$2, set: set$2, sync: sync$2, computed: computed$1, setter: setter$1, getter: getter$1, createGetters: createGetters$1, createState: createState$1, MissingStoreError: MissingStoreError$1 } = others;

export default TeddyStore;
export { MissingStoreError$1 as MissingStoreError, accessors, computed$1 as computed, createGetters$1 as createGetters, createState$1 as createState, get$2 as get, getter$1 as getter, has$2 as has, set$2 as set, setter$1 as setter, sync$2 as sync };
