/*!
  * vue-teddy-store v0.1.36
  * (c) 2020 Gabin Desserprit
  * @license MIT
  */
import { isObject, makeSet, makeHas, makeGet, isValidKey } from 'object-string-path';
import Vue from 'vue';
import VueCompositionMethods__default, { ref, isRef, provide, inject, computed as computed$1, watch } from '@vue/composition-api';

function isComputed(obj) {
  if (!isObject(obj) || (isObject(obj) && !('value' in obj))) {
    return false
  } else {
    const desc = Object.getOwnPropertyDescriptor(obj, 'value');
    return typeof desc.get === 'function' // && typeof desc.set === 'function'
  }
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

function afterGetSteps(steps = []) {
  return ['_state', ...steps]
}

const teddySet = makeSet({
  setProp,
  getProp,
  hasProp,
  afterGetSteps,
});

const teddyHas = makeHas({
  getProp,
  hasProp,
  afterGetSteps,
});

const teddyGet = makeGet({
  getProp,
  hasProp,
  afterGetSteps,
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
  teddySet: teddySet,
  teddyHas: teddyHas,
  teddyGet: teddyGet,
  set: set,
  has: has,
  get: get
});

Vue.use(VueCompositionMethods__default);

const Teddy = Symbol();
const TeddyStore = Symbol();

const Teddies = ref({
  __options: { devtools: true },
  spaces: {
    // $: {
    //   options: { devtools: true },
    //   stores: {
    //     // '@': {
    //     //   _state: {},
    //     //   state: {},
    //     //   getters: {},
    //     //   actions: {},
    //     //   watchers: [], // { path, handler }
    //     //   options: { devtools: true },
    //     // },
    //   },
    // },
  },
});

const DEFAULT_SPACE_NAME = '$';
const DEFAULT_STORE_NAME = '@';

const setStore = (spaceName, storeName, store) => {
  store = store || {};
  const _store = getTeddyStore(spaceName, storeName);
  setState(spaceName, storeName, store.state);
  setGetters(spaceName, storeName, store.getters);
  setActions(spaceName, storeName, store.actions);
  setWatchers(spaceName, storeName, store.watchers);
  return _store
};

const makeState = (_, __, state) => {
  return isRef(state) ? state : ref(state)
};

const applyState = (_, __, state, destination = {}) => {
  destination._state = makeState(_, __, state);
  if (!('state' in destination)) {
    Object.defineProperty(destination, 'state', {
      get: () => destination._state.value,
      set: (newState) => {
        destination._state.value = newState;
      },
      enumerable: true,
    });
  }
  return destination
};

const setState = (spaceName, storeName, state) => {
  const store = getTeddyStore(spaceName, storeName);
  applyState(spaceName, storeName, state, store);
};

const makeGetters = (spaceName, storeName, getters) => {
  const store = getTeddyStore(spaceName, storeName);
  getters = getters || {};
  return Object.keys(getters).reduce((acc, key) => {
    if (isComputed(getters[key])) {
      acc[key] = getters[key];
    } else if (typeof getters[key] === 'function') {
      acc[key] = computed(() => getters[key](store));
    }
    return acc
  }, {})
};

const setGetters = (spaceName, storeName, getters) => {
  const store = getTeddyStore(spaceName, storeName);
  store.getters = { ...(store.getters || {}), ...makeGetters(spaceName, storeName, getters) };
  return store
};

const makeActions = (spaceName, storeName, actions) => {
  const store = getTeddyStore(spaceName, storeName);
  actions = actions || {};
  return Object.keys(actions).reduce((acc, key) => {
    if (typeof actions[key] === 'function') {
      acc[key] = (...args) => actions[key](store, ...args);
    }
    return acc
  }, {})
};

const setActions = (spaceName, storeName, actions) => {
  const store = getTeddyStore(spaceName, storeName);
  store.actions = { ...(store.actions || {}), ...makeActions(spaceName, storeName, actions) };
  return store
};

const makeWatchers = (spaceName, storeName, watchers) => {
  const store = getTeddyStore(spaceName, storeName);

  const _watchers = [];
  if (Array.isArray(watchers)) {
    _watchers.push(...watchers);
  } else if (watchers) {
    _watchers.push(watchers);
  }

  // If no watchers
  if (_watchers.length === 0) return []

  return _watchers.reduce((list, watcher) => {
    const register = (path, watching, handler, options) => {
      const unwatch = watch(watching, handler, { deep: true, ...options });
      list.push({
        path,
        handler,
        options,
        unwatch,
      });
    };

    // Watcher is a function
    if (typeof watcher === 'function') {
      register(`state`, () => store.state, watcher, { deep: true });
    }
    // Watcher is an object definition with a .handler()
    else if (watcher && typeof watcher === 'object' && 'handler' in watcher) {
      const { handler, path, paths = [], ...options } = watcher;
      // Contains a path
      if (typeof path === 'string') {
        register(path, () => teddyGet(store, path), handler, { deep: true, ...options });
      }
      // Contains paths
      else if (paths.length > 0) {
        register(
          paths.map((p) => resolvePath([storeName, p])),
          paths.map((p) => () => teddyGet(store, p)),
          handler,
          { deep: true, ...options }
        );
      }
      // Global watcher
      else {
        register(`state`, () => store.state, handler, { deep: true, ...options });
      }
    }
    return list
  }, [])
};

const setWatchers = (spaceName, storeName, watchers) => {
  const store = getTeddyStore(spaceName, storeName);
  store.watchers = [...(store.watchers || []), ...makeWatchers(spaceName, storeName, watchers)];
  return store
};

const exists = (spaceName, storeName) => {
  if (storeName !== undefined) {
    return spaceName in Teddies.value.spaces && 'stores' in Teddies.value.spaces[spaceName] && storeName in Teddies.value.spaces[spaceName].stores
  } else {
    return spaceName in Teddies.value.spaces
  }
};

const remove = (spaceName, storeName) => {
  const teddy = getTeddy(spaceName);
  if (storeName in teddy.stores) delete teddy.stores[storeName];
};

// eslint-disable-next-line no-unused-vars
const reset = (spaceName, __) => {
  const teddy = getTeddy(spaceName);
  for (const storeName in teddy.stores) {
    remove(spaceName, storeName);
  }
};

const has$1 = (spaceName, storeName, path, context) => {
  const store = getTeddyStore(spaceName, storeName);
  return teddyHas(store, path, context)
};

const get$1 = (spaceName, storeName, path, context) => {
  const store = getTeddyStore(spaceName, storeName);
  return teddyGet(store, path, context)
};

const getter = (spaceName, storeName, path, context) => {
  return function() {
    return get$1(spaceName, storeName, path, context || this)
  }
};

const set$1 = (spaceName, storeName, path, value, context) => {
  const store = getTeddyStore(spaceName, storeName);
  teddySet(store, path, value, context);
};

const setter = (spaceName, storeName, path, context) => {
  return function(value) {
    set$1(spaceName, storeName, path, value, context || this);
  }
};

const sync = (spaceName, storeName, path, context) => {
  const _sync = (path, context) => {
    return {
      get: getter(spaceName, storeName, path, context),
      set: setter(spaceName, storeName, path, context),
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

const mapMethods = (mapper = (fn) => fn) => {
  return {
    setStore: mapper(setStore),
    makeState: mapper(makeState),
    setState: mapper(setState),
    applyState: mapper(applyState),
    makeGetters: mapper(makeGetters),
    setGetters: mapper(setGetters),
    makeActions: mapper(makeActions),
    setActions: mapper(setActions),
    makeWatchers: mapper(makeWatchers),
    setWatchers: mapper(setWatchers),
    exists: mapper(exists),
    remove: mapper(remove),
    reset: mapper(reset),
    has: mapper(has$1),
    get: mapper(get$1),
    getter: mapper(getter),
    set: mapper(set$1),
    setter: mapper(setter),
    sync: mapper(sync),
  }
};

const getTeddy = (spaceName = DEFAULT_SPACE_NAME) => {
  if (!(spaceName in Teddies.value.spaces)) Teddies.value.spaces[spaceName] = {};
  return Teddies.value.spaces[spaceName]
};

const getTeddyStore = (spaceName = DEFAULT_SPACE_NAME, storeName = DEFAULT_STORE_NAME) => {
  getTeddy(spaceName);
  if (!('stores' in Teddies.value.spaces[spaceName])) {
    Teddies.value.spaces[spaceName].stores = {};
  }
  if (!(storeName in Teddies.value.spaces[spaceName].stores)) {
    Teddies.value.spaces[spaceName].stores[storeName] = {
      getters: {},
      actions: {},
      watchers: [],
      options: {},
    };
    applyState(spaceName, storeName, {}, Teddies.value.spaces[spaceName].stores[storeName]);
  }
  return Teddies.value.spaces[spaceName].stores[storeName]
};

const useTeddy = (spaceName = DEFAULT_SPACE_NAME) => {
  getTeddy(spaceName);
  const proxy = (fn) => (...fnArgs) => fn(spaceName, ...fnArgs);
  return mapMethods(proxy)
};

const useTeddyStore = (...args) => {
  let spaceName = args[0] || DEFAULT_SPACE_NAME;
  let storeName = args[1] || DEFAULT_STORE_NAME;

  if (args.length === 1) {
    storeName = spaceName;
    spaceName = undefined;
  }

  const proxy = (fn) => (...fnArgs) => fn(spaceName, storeName, ...fnArgs);
  return mapMethods(proxy)
};

const provideTeddy = (spaceName = DEFAULT_SPACE_NAME) => {
  provide(Teddy, useTeddy(spaceName));
};

const provideTeddyStore = (...args) => {
  provide(TeddyStore, useTeddyStore(...args));
};

const injectTeddy = () => {
  inject(Teddy);
};

const injectTeddyStore = () => {
  inject(TeddyStore);
};

const computed = (definition) => {
  if (isObject(definition)) {
    const hasGetter = 'get' in definition && typeof definition.get === 'function';
    const hasSetter = 'set' in definition && typeof definition.set === 'function';
    if (hasGetter || hasSetter) {
      return computed$1(definition)
    } else {
      return Object.keys(definition).reduce((acc, key) => {
        acc[key] = computed$1(definition[key]);
        return acc
      }, {})
    }
  } else {
    return computed$1(definition)
  }
};

var methods = /*#__PURE__*/Object.freeze({
  __proto__: null,
  setStore: setStore,
  makeState: makeState,
  applyState: applyState,
  setState: setState,
  makeGetters: makeGetters,
  setGetters: setGetters,
  makeActions: makeActions,
  setActions: setActions,
  makeWatchers: makeWatchers,
  setWatchers: setWatchers,
  exists: exists,
  remove: remove,
  reset: reset,
  has: has$1,
  get: get$1,
  getter: getter,
  set: set$1,
  setter: setter,
  sync: sync,
  mapMethods: mapMethods,
  getTeddy: getTeddy,
  getTeddyStore: getTeddyStore,
  useTeddy: useTeddy,
  useTeddyStore: useTeddyStore,
  provideTeddy: provideTeddy,
  provideTeddyStore: provideTeddyStore,
  injectTeddy: injectTeddy,
  injectTeddyStore: injectTeddyStore,
  computed: computed
});

export default methods;
export { Teddies, accessors, computed, exists, get$1 as get, getTeddy, getTeddyStore, getter, has$1 as has, injectTeddy, injectTeddyStore, makeActions, makeGetters, makeState, makeWatchers, provideTeddy, provideTeddyStore, remove, reset, set$1 as set, setActions, setGetters, setState, setStore, setWatchers, setter, sync, useTeddy, useTeddyStore };
