(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('@vue/composition-api')) :
  typeof define === 'function' && define.amd ? define(['@vue/composition-api'], factory) :
  (global = global || self, global.VueTeddyStore = factory(global.compositionApi));
}(this, (function (compositionApi) { 'use strict';

  var templateObject = Object.freeze(["Couldn't not find any proper value for ", ""]);
  var VARIABLE_PATH = /({.+?})/gim;

  function resolvePath(instance) {
    return function (path) {
      var variablePath = get(instance, path.slice(1, -1).trim());
      if (['string', 'number'].includes(typeof variablePath)) {
        return variablePath
      } else {
        /* istanbul ignore next */
        throw new Error(templateObject, variablePath)()
      }
    }
  }

  function debounce(fn, wait) {
    if ( wait === void 0 ) wait = 100;

    var timeout;
    return function() {
      var this$1 = this;
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      clearTimeout(timeout);
      timeout = setTimeout(function () {
        fn.apply(this$1, args);
      }, wait);
    }
  }

  function get(obj, path, defaultValue, instance) {
    return String(path)
      .replace(/\[/g, '.')
      .replace(/]/g, '')
      .replace(VARIABLE_PATH, resolvePath(instance))
      .split('.')
      .reduce(function (acc, v) {
        try {
          acc = acc[v] === undefined ? defaultValue : acc[v];
        } catch (e) {
          /* istanbul ignore next */
          return defaultValue
        }
        return acc
      }, obj)
  }

  function set(obj, path, value, instance) {
    var steps = String(path)
      .replace(/\[/g, '.')
      .replace(/]/g, '')
      .replace(VARIABLE_PATH, resolvePath(instance))
      .split('.');

    var cleanStep = function (key) { return key.replace(/^\^/, ''); };

    var _set = function (item, steps, val) {
      var step = steps.shift();
      if (steps.length > 0) {
        if (Number.isInteger(+steps[0])) {
          item[step] = [];
          return _set(item[step], steps, val)
        } else if (!item[step]) {
          // To force an integer as an object property, prefix it with ^
          // If somehow you want to have a ^ in a key name, double it ^^
          item[cleanStep(step)] = {};
          return _set(item[cleanStep(step)], steps, val)
        }
      } else {
        item[cleanStep(step)] = val;
      }
    };

    _set(obj, steps, value);

    return obj
  }

  var prefix = function (name) { return ("teddy:store:" + name); };
  var CachePlugin = {
    handle: function handle(ref) {
      var name = ref.name;
      var store = ref.store;

      /* istanbul ignore next */
      var localStorage = window.localStorage || global.localStorage || {};
      /* istanbul ignore next */
      if (localStorage) {
        // Fetched saved state when exists
        var cached = localStorage.getItem(prefix(name));
        if (cached) { store._state = Object.assign({}, store._state, JSON.parse(cached)); }
        // Watch for mutations, save them
        compositionApi.watch(
          store._state,
          debounce(function (newState, oldState) {
            if (newState !== oldState) {
              localStorage.setItem(prefix(name), JSON.stringify(newState));
            }
          }, 500),
          { immediate: true, deep: true }
        );
      }
    },
  };

  var HistoryPlugin = {
    handle: function handle(ref) {
      var store = ref.store;

      store._history = compositionApi.reactive([]);
      compositionApi.watch(
        store._state,
        function (newState) {
          store._history.push(newState);
        },
        { immediate: true, deep: true }
      );
    },
  };

  var SyncPlugin = {
    handle: function handle(ref) {
      var name = ref.name;
      var store = ref.store;

      /* istanbul ignore next */
      if (window) {
        window.addEventListener('storage', function (e) {
          if (e.key === prefix(name)) {
            store._state = compositionApi.reactive(Object.assign({}, store._state, JSON.parse(e.newValue)));
          }
        });
      }
    },
  };

  function objectWithoutProperties (obj, exclude) { var target = {}; for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k) && exclude.indexOf(k) === -1) target[k] = obj[k]; return target; }

  function getInstance() {
    var solutions = [], len = arguments.length;
    while ( len-- ) solutions[ len ] = arguments[ len ];

    var instanceSolution = solutions.find(function (s) { return s && s instanceof TeddyStore; });
    var contextSolution = solutions.find(function (s) { return s && '$teddy' in s && s.$teddy instanceof TeddyStore; });
    var solution = instanceSolution || (contextSolution ? contextSolution.$teddy : undefined);
    if (!solution) {
      /* istanbul ignore next */
      throw new Error("Couldn't find any proper instance!")
    }
    return solution
  }

  var TeddyStore = function TeddyStore() {
    this._stores = compositionApi.reactive({});
    this._plugins = compositionApi.reactive({
      cache: CachePlugin,
      history: HistoryPlugin,
      sync: SyncPlugin,
    });
  };

  var prototypeAccessors = { stores: { configurable: true } };

  TeddyStore.prototype.add = function add (name, store) {
      var this$1 = this;
      var obj;

    // eslint-disable-next-line no-unused-vars
    var A = store._state;
      var B = store.state;
      var C = store.methods;
      var D = store.watchers;
      var rest = objectWithoutProperties( store, ["_state", "state", "methods", "watchers"] );
      var others = rest;

    var ref = TeddyStore.createState(store._state || store.state || {});
      var _state = ref._state;
      var state = ref.state;
    this._stores = Object.assign({}, this._stores,
      ( obj = {}, obj[name] = compositionApi.reactive(Object.assign({}, {_state: _state,
        state: state},
        (store.methods || {}),
        others)), obj ));

    var watchers = [];
    if (Array.isArray(store.watchers)) {
      watchers.push.apply(watchers, store.watchers);
    } else if (store.watcher) {
      watchers.push(store.watcher);
    }

    for (var watcher of watchers) {
      if (typeof watcher === 'function') {
        compositionApi.watch(this._stores[name].state, watcher, { deep: true });
      } else if (watcher && typeof watcher === 'object' && 'handler' in watcher) {
        var handler = watcher.handler;
          var path = watcher.path;
          var paths = watcher.paths; if ( paths === void 0 ) paths = [];
          var rest = objectWithoutProperties( watcher, ["handler", "path", "paths"] );
          var options = rest;
        if (path) {
          // console.log("utils.get(this._stores[name].state, path)", utils.get(this._stores[name].state, path));
          compositionApi.watch(function () { return get(this$1._stores[name].state, path); }, handler, Object.assign({}, {deep: true}, options));
        } else if (paths.length > 0) {
          compositionApi.watch(
            paths.map(function (p) { return function () { return get(this$1._stores[name].state, p); }; }),
            handler,
            Object.assign({}, {deep: true}, options)
          );
        } else {
          compositionApi.watch(function () { return this$1._stores[name].state; }, handler, Object.assign({}, {deep: true}, options));
        }
      }
    }

    return this
  };

  TeddyStore.prototype.use = function use (plugin) {
      var this$1 = this;
      if ( plugin === void 0 ) plugin = {};

    if (typeof plugin.install === 'function') { plugin.install(this); }
    if (typeof plugin.handle === 'function') { Object.keys(this._stores).map(function (name) { return plugin.handle.call(this$1, { name: name, store: this$1._stores[name] }); }); }
    return this
  };

  TeddyStore.prototype.activate = function activate (pluginNames) {
      if ( pluginNames === void 0 ) pluginNames = [];

    if (!Array.isArray(pluginNames)) { pluginNames = [pluginNames]; }
    for (var pluginName of pluginNames) {
      if (pluginName in this._plugins) {
        this.use(this._plugins[pluginName]);
      }
    }
    return this
  };

  TeddyStore.prototype.install = function install (VueInstance) {
    VueInstance.prototype.$Teddy = TeddyStore;
    VueInstance.prototype.$teddy = this;
  };

  prototypeAccessors.stores.get = function () {
    return this._stores
  };

  TeddyStore.createState = function createState (stateObj) {
      if ( stateObj === void 0 ) stateObj = {};

    var _state = compositionApi.isRef(stateObj) ? stateObj : compositionApi.ref(stateObj);
    /* Until it's made available by Vue 3, be careful with { state } as it can be deeply mutable*/
    // const state = readonly(() => _state.value)
    var state = compositionApi.computed(function () { return _state.value; });
    return { _state: _state, state: state }
  };

  TeddyStore.prototype.get = function get (name, path) {
    return TeddyStore.get.call(this, name, path)
  };

  TeddyStore.get = function get$1 (name, path, context) {
    context = context || this;
    return function get$1() {
      var _instance = getInstance(this, context);
      try {
        return get(_instance.stores[name].state, path, undefined, context)
      } catch (error) {
        /* istanbul ignore next */
        throw new Error(("Couldn't compute (get) path '" + path + "' for '" + name + "'"))
      }
    }
  };

  TeddyStore.prototype.set = function set (name, path) {
    return TeddyStore.set.call(this, name, path)
  };

  TeddyStore.set = function set$1 (name, path, context) {
    context = context || this;
    return function set$1(value) {
      var _instance = getInstance(this, context);
      try {
        set(_instance.stores[name]._state, path, value, context);
      } catch (error) {
        /* istanbul ignore next */
        throw new Error(("Couldn't compute (set) path '" + path + "' for '" + name + "'"))
      }
    }
  };

  TeddyStore.prototype.compute = function compute (name, path) {
    return TeddyStore.compute.call(this, name, path)
  };

  TeddyStore.compute = function compute (name, path) {
    var get = TeddyStore.get.call(this, name, path);
    var set = TeddyStore.set.call(this, name, path);
    return {
      get: get,
      set: set,
    }
  };

  Object.defineProperties( TeddyStore.prototype, prototypeAccessors );

  return TeddyStore;

})));
//# sourceMappingURL=vue-teddy-store.umd.js.map
