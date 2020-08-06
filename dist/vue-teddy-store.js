/*!
  * vue-teddy-store v0.2.62
  * (c) 2020 Gabin Desserprit
  * @license MIT
  */
var VueTeddyStore = (function (exports, VueCompositionMethods, objectStringPath, Vue, equal) {
  'use strict';

  var VueCompositionMethods__default = 'default' in VueCompositionMethods ? VueCompositionMethods['default'] : VueCompositionMethods;
  Vue = Vue && Object.prototype.hasOwnProperty.call(Vue, 'default') ? Vue['default'] : Vue;
  equal = equal && Object.prototype.hasOwnProperty.call(equal, 'default') ? equal['default'] : equal;

  const prefix = (space, name) => `teddy:${space}:${name}`;
  var cache = {
    store(space, name) {
      const store = getStore({ space, name });
      if (store.features.cache) {
        return
      }

      /* istanbul ignore next */
      const localStorage = window.localStorage || global.localStorage || {};
      /* istanbul ignore next */
      if (localStorage) {
        // Fetched saved state when exists
        const cached = localStorage.getItem(prefix(space, name));
        if (cached) store.state = JSON.parse(cached);
        // Watch for mutations, save them
        setWatchers(
          { space, name },
          {
            handler(newState) {
              localStorage.setItem(prefix(space, name), JSON.stringify(newState));
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
      const store = getStore({ space, name });
      if (store.features.history) {
        return
      } else {
        store.features.history = {};
      }

      store.features.history.stack = VueCompositionMethods.reactive([]);
      setWatchers(
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
      const store = getStore({ space, name });
      if (store.features.sync) {
        return
      } else {
        store.features.sync = {};
      }

      /* istanbul ignore next */
      if (window) {
        window.addEventListener('storage', (e) => {
          if (e.key === prefix(space, name)) {
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
    if (!objectStringPath.isObject(obj) || (objectStringPath.isObject(obj) && !('value' in obj))) {
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

  // import * as memoize from './memoize'

  function setProp(obj, key, value) {
    if (objectStringPath.isObject(obj) || Array.isArray(obj)) {
      if (objectStringPath.isValidKey(key)) {
        if (VueCompositionMethods.isRef(obj)) {
          VueCompositionMethods.set(obj.value, key, value);
        } else {
          VueCompositionMethods.set(obj, key, value);
        }
        return VueCompositionMethods.unref(obj)[key]
      } else {
        if (VueCompositionMethods.isRef(obj)) {
          obj.value = value;
        } else {
          obj = value;
        }
      }
    }
  }

  function getProp(obj, key) {
    if (objectStringPath.isObject(obj) || Array.isArray(obj)) {
      if (objectStringPath.isValidKey(key)) {
        if (VueCompositionMethods.isRef(obj)) {
          if (key in obj.value) {
            return obj.value[key]
          } else {
            return
            // return obj.value
          }
        } else {
          return obj[key]
        }
      } else {
        if (VueCompositionMethods.isRef(obj)) {
          return obj.value
        } else {
          return obj
        }
      }
    }
  }

  function hasProp(obj, key) {
    if (!objectStringPath.isObject(obj) && !Array.isArray(obj)) {
      return false
    } else if (objectStringPath.isValidKey(key)) {
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

  function removeProp(obj, key) {
    const objValue = VueCompositionMethods.unref(obj);
    const objIsRef = VueCompositionMethods.isRef(obj);
    if (Array.isArray(objValue)) {
      if (objIsRef) {
        obj.value.splice(+key, 1);
      } else {
        obj.splice(+key, 1);
      }
      return true
    } else if (objectStringPath.isObject(objValue)) {
      if (objIsRef) {
        obj.value = omit(obj.value, [key]);
      } else {
        delete obj[key];
      }
      return true
    } else {
      // nothing can be done?
      // Handle more types
      return false
    }
  }

  function afterGetSteps(steps = []) {
    return steps[0] !== '_state' ? ['_state', ...steps] : steps
  }

  const teddySet = objectStringPath.makeSet({
    setProp,
    getProp,
    hasProp,
    afterGetSteps,
  });

  const teddyHas = objectStringPath.makeHas({
    getProp,
    hasProp,
    afterGetSteps,
  });

  const teddyGet = () =>
    // space, name
    objectStringPath.makeGet({
      getProp,
      hasProp,
      afterGetSteps,
      // proxy: memoize.get(space, name),
    });

  const teddyRemove = () =>
    // space, name
    objectStringPath.makeRemove({
      // TODO: This uses afterGetSteps in the teddyGet
      // Seek for a solution when memoize will be activated
      // get: teddyGet(space, name),
      getProp,
      hasProp,
      removeProp,
      afterGetSteps,
    });

  const set = objectStringPath.makeSet({
    setProp,
    getProp,
    hasProp,
  });

  const has = objectStringPath.makeHas({
    getProp,
    hasProp,
  });

  const get = objectStringPath.makeGet({
    getProp,
    hasProp,
  });

  const remove = objectStringPath.makeRemove({
    get,
    getProp,
    hasProp,
  });

  var accessors = /*#__PURE__*/Object.freeze({
    __proto__: null,
    teddySet: teddySet,
    teddyHas: teddyHas,
    teddyGet: teddyGet,
    teddyRemove: teddyRemove,
    set: set,
    has: has,
    get: get,
    remove: remove
  });

  Vue.use(VueCompositionMethods__default);

  const Teddy = Symbol();
  const TeddyStore = Symbol();

  const Teddies = {
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
  };

  const DEFAULT_SPACE_NAME = '$';
  const DEFAULT_STORE_NAME = '@';

  const parseDefinition = (definition) => {
    let _space;
    let _name;

    if (objectStringPath.isObject(definition)) {
      _space = 'space' in definition ? definition.space : DEFAULT_SPACE_NAME;
      _name = 'name' in definition ? definition.name : DEFAULT_STORE_NAME;
    } else if (typeof definition === 'string') {
      if (definition.includes('.')) {
        let [space, name] = definition.split('.');
        _space = space;
        _name = name;
      } else if (definition.includes('/')) {
        let [space, name] = definition.split('/');
        _space = space;
        _name = name;
      } else {
        _space = DEFAULT_SPACE_NAME;
        _name = definition;
      }
    }

    if (typeof _space === 'string') {
      _space = _space.trim();
      if (_space.length === 0) {
        _space = undefined;
      }
    }
    if (typeof _name === 'string') {
      _name = _name.trim();
      if (_name.length === 0) {
        _name = undefined;
      }
    }

    return { space: _space, name: _name }
  };

  const setStore = (definition, store) => {
    const _definition = parseDefinition(definition);
    store = store || {};
    const _store = getStore(_definition);
    setState(_definition, store.state);
    setGetters(_definition, store.getters);
    setActions(_definition, store.actions);
    setWatchers(_definition, store.watchers);
    return _store
  };

  const makeState = (_, state) => {
    return VueCompositionMethods.isRef(state) ? state : VueCompositionMethods.ref(state)
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
    const store = getStore(definition);
    applyState(definition, state, store);
  };

  const makeGetters = (definition, getters) => {
    const store = getStore(definition);
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
    const store = getStore(definition);
    store.getters = { ...(store.getters || {}), ...makeGetters(definition, getters) };
    return store
  };

  const makeActions = (definition, actions) => {
    const store = getStore(definition);
    actions = actions || {};
    return Object.keys(actions).reduce((acc, key) => {
      if (typeof actions[key] === 'function') {
        acc[key] = (...args) => actions[key](store, ...args);
      }
      return acc
    }, {})
  };

  const setActions = (definition, actions) => {
    const store = getStore(definition);
    store.actions = { ...(store.actions || {}), ...makeActions(definition, actions) };
    return store
  };

  const makeWatchers = (definition, watchers) => {
    const { space, name } = parseDefinition(definition);
    const store = getStore(definition);

    const _watchers = [];
    if (Array.isArray(watchers)) {
      _watchers.push(...watchers);
    } else if (watchers) {
      _watchers.push(watchers);
    }

    // If no watchers
    if (_watchers.length === 0) return []

    return _watchers.reduce((list, watcher) => {
      // NOTE: Added the wrapper because of some weird reactivity with memoize. To keep an eye on.
      const wrapper = (fn) =>
        function(newState, oldState) {
          fn.call(this, newState, oldState, equal(newState, oldState));
        };

      const signWatcher = (path = '', handler) => `${path}||${handler.toString()}`;
      const register = (path, watching, handler, options) => {
        list.push({
          path,
          signature: signWatcher(path, handler),
          options,
          start() {
            this.unwatch = VueCompositionMethods.watch(watching, wrapper(handler), { deep: true, ...options });
            return this
          },
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
          register(path, () => teddyGet()(store, path), handler, { deep: true, ...options });
        }
        // Contains paths
        else if (paths.length > 0) {
          register(
            paths.map((p) => resolvePath([name, p])),
            paths.map((p) => () => teddyGet()(store, p)),
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
    const store = getStore(definition);
    for (const watcher of makeWatchers(definition, watchers)) {
      const exists = store.watchers.find((_watcher) => {
        const samePath = _watcher.path === watcher.path;
        const sameHandler = _watcher.signature === watcher.signature;
        return samePath && sameHandler
      });
      if (exists) {
        exists.unwatch();
      }
      store.watchers.push(watcher.start());
    }
    return store
  };

  const exists = (definition) => {
    const { space, name } = parseDefinition(definition);
    if (name !== undefined) {
      return space in Teddies.spaces && 'stores' in Teddies.spaces[space] && name in Teddies.spaces[space].stores
    } else {
      return space in Teddies.spaces
    }
  };

  // export const remove = (definition) => {
  //   const { space, name } = parseDefinition(definition)
  //   const teddy = getTeddy(space)
  //   if (name in teddy.stores) delete teddy.stores[name]
  // }

  // eslint-disable-next-line no-unused-vars
  const reset = (definition) => {
    // const { space, name } = parseDefinition(definition)
    // const teddy = getTeddy(space)
    // for (const _name in teddy.stores) {
    //   remove(definition)
    // }
  };

  const run = (definition, actionName, ...args) => {
    const { store } = useStore(definition);
    if (actionName in store.actions) {
      try {
        return store.actions[actionName](...args)
      } catch (error) {
        console.error(`Something went wrong with the action '${actionName}'`);
        console.error(error);
      }
    } else {
      console.warn(`Couldn't find the action '${actionName}' to run.`);
    }
  };

  const remove$1 = (definition, path, context) => {
    if (Vue.config.devtools) {
      console.log(`remove()`, { definition, path, context });
    }
    const { space, name } = parseDefinition(definition);
    const store = getStore({ space, name });
    return teddyRemove()(store, path, context)
  };

  const has$1 = (definition, path, context) => {
    const store = getStore(definition);
    return teddyHas(store, path, context)
  };

  const get$1 = (definition, path, context, orValue) => {
    const { space, name } = parseDefinition(definition);
    const store = getStore({ space, name });
    return teddyGet()(store, path, context) || orValue
  };

  const getter = (definition, path, context, orValue) => {
    return function() {
      return get$1(definition, path, context || this, orValue)
    }
  };

  const set$1 = (definition, path, value, context) => {
    if (Vue.config.devtools) {
      console.log(`set()`, { definition, path, value, context });
    }
    const store = getStore(definition);
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
    else if (objectStringPath.isObject(path)) {
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
      feature.teddy(Teddies);
    }
    for (const space of Object.keys(Teddies.spaces || {})) {
      if (typeof feature.space === 'function') {
        feature.space(space);
      }
      for (const name of Object.keys(Teddies.spaces[space].stores || {})) {
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
      reset: mapper(reset),
      run: mapper(run),
      remove: mapper(remove$1),
      has: mapper(has$1),
      get: mapper(get$1),
      getter: mapper(getter),
      set: mapper(set$1),
      setter: mapper(setter),
      sync: mapper(sync$1),
    }
  };

  const getTeddy = (space = DEFAULT_SPACE_NAME) => {
    if (!(space in Teddies.spaces)) Teddies.spaces[space] = {};
    return Teddies.spaces[space]
  };

  const useTeddy = (space = DEFAULT_SPACE_NAME) => {
    const store = getTeddy(space);
    const proxy = (fn) => (...fnArgs) => fn({ space, name: DEFAULT_STORE_NAME }, ...fnArgs);
    return { store, ...mapMethods(proxy) }
  };

  // export const useStore = (name = DEFAULT_STORE_NAME) => {
  //   const store = getStore(name)
  //   const proxy = (fn) => (...fnArgs) => fn({ name, space: DEFAULT_SPACE_NAME }, ...fnArgs)
  //   return { store, ...mapMethods(proxy) }
  // }

  const getStore = (definition) => {
    const { space = DEFAULT_SPACE_NAME, name = DEFAULT_STORE_NAME } = parseDefinition(definition);
    getTeddy(space);

    if (!('stores' in Teddies.spaces[space])) {
      Teddies.spaces[space].stores = {};
    }

    if (!(name in Teddies.spaces[space].stores)) {
      Teddies.spaces[space].stores[name] = {
        getters: {},
        actions: {},
        watchers: [],
        options: {},
        features: {},
      };
      applyState({ space, name }, {}, Teddies.spaces[space].stores[name]);
    }
    return Teddies.spaces[space].stores[name]
  };

  const useStore = (definition) => {
    const store = getStore(definition);
    const proxy = (fn) => (...fnArgs) => fn(definition, ...fnArgs);
    return { store, ...mapMethods(proxy) }
  };

  // export const provideTeddy = (space = DEFAULT_SPACE_NAME) => {
  //   VueCompositionMethods.provide(Teddy, useTeddy(space))
  // }

  const provideTeddyStore = (definition) => {
    VueCompositionMethods.provide(TeddyStore, useStore(definition));
  };

  const injectTeddy = () => {
    VueCompositionMethods.inject(Teddy);
  };

  const injectTeddyStore = () => {
    VueCompositionMethods.inject(TeddyStore);
  };

  const computed = (definition) => {
    if (objectStringPath.isObject(definition)) {
      const hasGetter = 'get' in definition && typeof definition.get === 'function';
      const hasSetter = 'set' in definition && typeof definition.set === 'function';
      if (hasGetter || hasSetter) {
        return VueCompositionMethods.computed(definition)
      } else {
        return Object.keys(definition).reduce((acc, key) => {
          acc[key] = VueCompositionMethods.computed(definition[key]);
          return acc
        }, {})
      }
    } else {
      return VueCompositionMethods.computed(definition)
    }
  };

  var output = /*#__PURE__*/Object.freeze({
    __proto__: null,
    accessors: accessors,
    features: index,
    Teddy: Teddy,
    TeddyStore: TeddyStore,
    Teddies: Teddies,
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
    reset: reset,
    run: run,
    remove: remove$1,
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
    provideTeddyStore: provideTeddyStore,
    injectTeddy: injectTeddy,
    injectTeddyStore: injectTeddyStore,
    computed: computed
  });

  const install = (VueInstance) => {
    VueInstance.prototype.$teddy = output;
  };

  exports.Teddies = Teddies;
  exports.Teddy = Teddy;
  exports.TeddyStore = TeddyStore;
  exports.accessors = accessors;
  exports.applyState = applyState;
  exports.computed = computed;
  exports.exists = exists;
  exports.features = index;
  exports.get = get$1;
  exports.getStore = getStore;
  exports.getTeddy = getTeddy;
  exports.getter = getter;
  exports.has = has$1;
  exports.injectTeddy = injectTeddy;
  exports.injectTeddyStore = injectTeddyStore;
  exports.install = install;
  exports.makeActions = makeActions;
  exports.makeGetters = makeGetters;
  exports.makeState = makeState;
  exports.makeWatchers = makeWatchers;
  exports.mapMethods = mapMethods;
  exports.provideTeddyStore = provideTeddyStore;
  exports.remove = remove$1;
  exports.reset = reset;
  exports.run = run;
  exports.set = set$1;
  exports.setActions = setActions;
  exports.setFeature = setFeature;
  exports.setGetters = setGetters;
  exports.setState = setState;
  exports.setStore = setStore;
  exports.setWatchers = setWatchers;
  exports.setter = setter;
  exports.sync = sync$1;
  exports.useStore = useStore;
  exports.useTeddy = useTeddy;

  return exports;

}({}, vueCompositionApi, objectStringPath, Vue, equal));
