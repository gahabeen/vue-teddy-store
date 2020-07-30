/*!
  * vue-teddy-store v0.1.36
  * (c) 2020 Gabin Desserprit
  * @license MIT
  */
import { getTeddyStore as getTeddyStore$1, setWatchers as setWatchers$1 } from '@/index';
import VueCompositionMethods__default, { reactive, ref, isRef, provide, inject, computed as computed$1, watch } from '@vue/composition-api';
import { isObject, makeSet, makeHas, makeGet, isValidKey } from 'object-string-path';
import Vue from 'vue';

const prefix = (space, name) => `teddy:${space}:${name}`;
var cache = {
  store(space, name) {
    const store = getTeddyStore$1(space, name);
    if (store.features.cache) {
      return
    }

    /* istanbul ignore next */
    const localStorage = window.localStorage || global.localStorage || {};
    /* istanbul ignore next */
    if (localStorage) {
      // Fetched saved state when exists
      const cached = localStorage.getItem(prefix(space, name));
      if (cached) store.state = { ...store.state, ...JSON.parse(cached) };
      // Watch for mutations, save them
      setWatchers$1(
        { space, name },
        {
          handler(newState, oldState) {
            if (newState !== oldState) {
              localStorage.setItem(prefix(space, name), JSON.stringify(newState));
            }
          },
          immediate: true,
          deep: true,
        }
      );

      store.features.cache = true;
    }
  },
};

var history = {
  store(space, name) {
    const store = getTeddyStore$1(space, name);
    if (store.features.history) {
      return
    } else {
      store.features.history = {};
    }

    store.features.history.stack = reactive([]);
    setWatchers$1(
      { space, name },
      {
        handler(newState) {
          store.features.history.stack.push({
            state: newState,
            ts: new Date().getTime(),
          });
        },
        immediate: true,
        deep: true,
      }
    );

    store.features.history.installed = true;
  },
};

var sync = {
  store(space, name) {
    const store = getTeddyStore$1(space, name);
    if (store.features.sync) {
      return
    } else {
      store.features.sync = {};
    }

    /* istanbul ignore next */
    if (window) {
      window.addEventListener('storage', (e) => {
        if (e.key === prefix(name)) {
          store.state = { ...store.state, ...JSON.parse(e.newValue) };
        }
      });
    }

    store.features.sync.installed = true;
  },
};

var index = /*#__PURE__*/Object.freeze({
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

const parseDefinition = (spaceOrDefinitionOrStringified = DEFAULT_SPACE_NAME, nameOrDefinition = DEFAULT_STORE_NAME) => {
  let _space = spaceOrDefinitionOrStringified;
  let _name = nameOrDefinition;
  if (typeof spaceOrDefinitionOrStringified === 'string' && spaceOrDefinitionOrStringified.includes('.')) {
    const fragments = spaceOrDefinitionOrStringified.split('.');
    _space = fragments[0] || _space;
    _name = fragments[1] || _name;
  } else if (spaceOrDefinitionOrStringified && isObject(spaceOrDefinitionOrStringified)) {
    _space = spaceOrDefinitionOrStringified.space || _space;
    _name = spaceOrDefinitionOrStringified.name || _name;
  } else if (nameOrDefinition && isObject(nameOrDefinition)) {
    _space = nameOrDefinition.space || _space;
    _name = nameOrDefinition.name || _name;
  }
  
  if (typeof _space === 'string') _space = _space.trim();
  if (typeof _name === 'string') _name = _name.trim();

  return { space: _space, name: _name }
};

const setStore = (nameOrDefinition, store) => {
  const _definition = parseDefinition(isObject(nameOrDefinition) ? nameOrDefinition : { name: nameOrDefinition });
  store = store || {};
  const _store = getTeddyStore(_definition);
  setState(_definition, store.state);
  setGetters(_definition, store.getters);
  setActions(_definition, store.actions);
  setWatchers(_definition, store.watchers);
  return _store
};

const makeState = (_, state) => {
  return isRef(state) ? state : ref(state)
};

const applyState = (definition, state, destination = {}) => {
  destination._state = makeState(definition, state);
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

const setState = (definition, state) => {
  const store = getTeddyStore(definition);
  applyState(definition, state, store);
};

const makeGetters = (definition, getters) => {
  const store = getTeddyStore(definition);
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

const setGetters = (definition, getters) => {
  const store = getTeddyStore(definition);
  store.getters = { ...(store.getters || {}), ...makeGetters(definition, getters) };
  return store
};

const makeActions = (definition, actions) => {
  const store = getTeddyStore(definition);
  actions = actions || {};
  return Object.keys(actions).reduce((acc, key) => {
    if (typeof actions[key] === 'function') {
      acc[key] = (...args) => actions[key](store, ...args);
    }
    return acc
  }, {})
};

const setActions = (definition, actions) => {
  const store = getTeddyStore(definition);
  store.actions = { ...(store.actions || {}), ...makeActions(definition, actions) };
  return store
};

const makeWatchers = (definition, watchers) => {
  const { name } = parseDefinition(definition);
  const store = getTeddyStore(definition);

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
          paths.map((p) => resolvePath([name, p])),
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

const setWatchers = (definition, watchers) => {
  const store = getTeddyStore(definition);
  store.watchers = [...(store.watchers || []), ...makeWatchers(definition, watchers)];
  return store
};

const exists = (definition) => {
  const { space, name } = parseDefinition(definition);
  if (name !== undefined) {
    return space in Teddies.value.spaces && 'stores' in Teddies.value.spaces[space] && name in Teddies.value.spaces[space].stores
  } else {
    return space in Teddies.value.spaces
  }
};

const remove = (definition) => {
  const { space, name } = parseDefinition(definition);
  const teddy = getTeddy(space);
  if (name in teddy.stores) delete teddy.stores[name];
};

// eslint-disable-next-line no-unused-vars
const reset = (definition) => {
  // const { space, name } = parseDefinition(definition)
  // const teddy = getTeddy(space)
  // for (const _name in teddy.stores) {
  //   remove(definition)
  // }
};

const has$1 = (definition, path, context) => {
  const store = getTeddyStore(definition);
  return teddyHas(store, path, context)
};

const get$1 = (definition, path, context) => {
  const store = getTeddyStore(definition);
  return teddyGet(store, path, context)
};

const getter = (definition, path, context) => {
  return function() {
    return get$1(definition, path, context || this)
  }
};

const set$1 = (definition, path, value, context) => {
  const store = getTeddyStore(definition);
  teddySet(store, path, value, context);
};

const setter = (definition, path, context) => {
  return function(value) {
    set$1(definition, path, value, context || this);
  }
};

const sync$1 = (definition, path, context) => {
  const _sync = (path, context) => {
    return {
      get: getter(definition, path, context),
      set: setter(definition, path, context),
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

const setFeature = (feature = {}) => {
  if (typeof feature.teddy === 'function') {
    feature.teddy(Teddies.value);
  }
  for (const space of Object.keys(Teddies.value.spaces || {})) {
    if (typeof feature.space === 'function') {
      feature.space(space);
    }
    for (const name of Object.keys(Teddies.value.spaces[space].stores || {})) {
      if (typeof feature.store === 'function') {
        feature.store(space, name);
      }
    }
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
    sync: mapper(sync$1),
  }
};

const getTeddy = (space = DEFAULT_SPACE_NAME) => {
  if (!(space in Teddies.value.spaces)) Teddies.value.spaces[space] = {};
  return Teddies.value.spaces[space]
};

const useTeddy = (space = DEFAULT_SPACE_NAME) => {
  const store = getTeddy(space);
  const proxy = (fn) => (...fnArgs) => fn({ space, name: DEFAULT_STORE_NAME }, ...fnArgs);
  return { store, ...mapMethods(proxy) }
};

const getStore = (name = DEFAULT_STORE_NAME) => {
  return getTeddyStore(DEFAULT_SPACE_NAME, name)
};

const useStore = (name = DEFAULT_STORE_NAME) => {
  const store = getStore(name);
  const proxy = (fn) => (...fnArgs) => fn({ name, space: DEFAULT_SPACE_NAME }, ...fnArgs);
  return { store, ...mapMethods(proxy) }
};

const getTeddyStore = (spaceOrDefinition, maybeName) => {
  const { space, name } = parseDefinition(spaceOrDefinition, maybeName);
  getTeddy(space);
  if (!('stores' in Teddies.value.spaces[space])) {
    Teddies.value.spaces[space].stores = {};
  }
  if (!(name in Teddies.value.spaces[space].stores)) {
    Teddies.value.spaces[space].stores[name] = {
      getters: {},
      actions: {},
      watchers: [],
      options: {},
      features: {},
    };
    applyState({ space, name }, {}, Teddies.value.spaces[space].stores[name]);
  }
  return Teddies.value.spaces[space].stores[name]
};

const useTeddyStore = (space = DEFAULT_SPACE_NAME, name = DEFAULT_STORE_NAME) => {
  const store = getTeddyStore(space, name);
  const proxy = (fn) => (...fnArgs) => fn({ space, name }, ...fnArgs);
  return { store, ...mapMethods(proxy) }
};

const provideTeddy = (space = DEFAULT_SPACE_NAME) => {
  provide(Teddy, useTeddy(space));
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

var output = /*#__PURE__*/Object.freeze({
  __proto__: null,
  accessors: accessors,
  features: index,
  Teddy: Teddy,
  TeddyStore: TeddyStore,
  Teddies: Teddies,
  parseDefinition: parseDefinition,
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
  sync: sync$1,
  setFeature: setFeature,
  mapMethods: mapMethods,
  getTeddy: getTeddy,
  useTeddy: useTeddy,
  getStore: getStore,
  useStore: useStore,
  getTeddyStore: getTeddyStore,
  useTeddyStore: useTeddyStore,
  provideTeddy: provideTeddy,
  provideTeddyStore: provideTeddyStore,
  injectTeddy: injectTeddy,
  injectTeddyStore: injectTeddyStore,
  computed: computed
});

const install = (VueInstance) => {
  VueInstance.prototype.$teddy = output;
};

export { Teddies, Teddy, TeddyStore, accessors, applyState, computed, exists, index as features, get$1 as get, getStore, getTeddy, getTeddyStore, getter, has$1 as has, injectTeddy, injectTeddyStore, install, makeActions, makeGetters, makeState, makeWatchers, mapMethods, parseDefinition, provideTeddy, provideTeddyStore, remove, reset, set$1 as set, setActions, setFeature, setGetters, setState, setStore, setWatchers, setter, sync$1 as sync, useStore, useTeddy, useTeddyStore };
