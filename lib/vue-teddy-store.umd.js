(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('vue'), require('@vue/composition-api')) :
  typeof define === 'function' && define.amd ? define(['vue', '@vue/composition-api'], factory) :
  (global = global || self, global.VueTeddyStore = factory(global.Vue, global.VueCompositionApi));
}(this, (function (Vue, VueCompositionApi) { 'use strict';

  Vue = Vue && Object.prototype.hasOwnProperty.call(Vue, 'default') ? Vue['default'] : Vue;
  var VueCompositionApi__default = 'default' in VueCompositionApi ? VueCompositionApi['default'] : VueCompositionApi;

  Vue.use(VueCompositionApi__default);

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

  function isComputed(obj) {
    if (!obj || typeof obj !== 'object' || !('value' in obj)) { return false }
    var desc = Object.getOwnPropertyDescriptor(obj, 'value');
    return typeof desc.get === 'function' && typeof desc.set === 'function'
  }

  function omit(obj, keys) {
    if ( keys === void 0 ) keys = [];

    return Object.keys(obj).reduce(function (acc, key) {
      if (!key.includes(keys)) {
        acc[key] = obj[key];
      }
      return acc
    }, {})
  }

  function hasProp(obj, key) {
    if (!obj || typeof obj !== 'object') { return }
    if (isComputed(obj) && key in obj.value) {
      return true
    } else if (key in obj) {
      return true
    } else {
      return false
    }
  }

  function getProp(obj, key) {
    if (isComputed(obj) && key in obj.value) {
      return obj.value[key]
    } else if (key in obj) {
      return obj[key]
    }
  }

  function setProp(obj, key, value) {
    if (isComputed(obj) && key in obj.value) {
      obj.value[key] = value;
      return obj.value[key]
    } else {
      obj[key] = value;
      return obj[key]
    }
  }

  function get(obj, path, defaultValue, instance) {
    var steps = String(path)
      .replace(/\[/g, '.')
      .replace(/]/g, '')
      .replace(VARIABLE_PATH, resolvePath(instance))
      .split('.');

    function _get(item, steps, fallback) {
      if (steps.length > 0) {
        var step = steps.shift();
        var stepValue = getProp(item, step) || fallback;
        // console.log("_get stepValue", stepValue);
        return _get(stepValue, steps, fallback)
      } else {
        // console.log("_get", item);
        return item
      }
    }

    return _get(obj, steps, defaultValue)
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
          return _set(setProp(item, step, []), steps, val)
        } else if (!hasProp(item, cleanStep(step))) {
          // To force an integer as an object property, prefix it with ^
          // If somehow you want to have a ^ in a key name, double it ^^
          return _set(setProp(item, cleanStep(step), {}), steps, val)
        } else {
          return _set(getProp(item, cleanStep(step)), steps, val)
        }
      } else {
        setProp(item, cleanStep(step), val);
      }
    };

    if (steps.length > 0) {
      _set(obj, steps, value);
    } else {
      // hmm
      if (obj.value) {
        obj.value = value;
      } else {
        obj = value;
      }
    }

    return obj
  }

  // import { debounce } from '../utils'

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
        // const cached = localStorage.getItem(prefix(name))
        // if (cached) store._state = { ...store._state, ...JSON.parse(cached) }
        // Watch for mutations, save them
        VueCompositionApi.watch(
          function () { return store._state; },
          function (newState, oldState) {
            console.log('caching', newState);
            if (newState !== oldState) {
              localStorage.setItem(prefix(name), JSON.stringify(newState));
            }
          },
          { immediate: true, deep: true }
        );
      }
    },
  };

  var HistoryPlugin = {
    handle: function handle(ref) {
      var store = ref.store;

      store._history = VueCompositionApi.reactive([]);
      VueCompositionApi.watch(
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
            store._state = VueCompositionApi.reactive(Object.assign({}, store._state, JSON.parse(e.newValue)));
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
    this._stores = {};
    this._plugins = {
      cache: CachePlugin,
      history: HistoryPlugin,
      sync: SyncPlugin,
    };
  };

  var prototypeAccessors = { stores: { configurable: true } };

  TeddyStore.prototype.add = function add (name, store) {
      var this$1 = this;

    // eslint-disable-next-line no-unused-vars
    var others = omit(store, ['_state', 'state', 'methods', 'watchers']);

    var states = TeddyStore.createState(store._state || store.state || {});
    this._stores[name] = VueCompositionApi.ref(Object.assign({}, states,
      (store.methods || {}),
      others));

    var watchers = [];
    if (Array.isArray(store.watchers)) {
      watchers.push.apply(watchers, store.watchers);
    } else if (store.watcher) {
      watchers.push(store.watcher);
    }

    for (var watcher of watchers) {
      if (typeof watcher === 'function') {
        VueCompositionApi.watch(function () { return this$1._stores[name].value.state.value; }, watcher, { deep: true });
      } else if (watcher && typeof watcher === 'object' && 'handler' in watcher) {
        var handler = watcher.handler;
          var path = watcher.path;
          var paths = watcher.paths; if ( paths === void 0 ) paths = [];
          var rest = objectWithoutProperties( watcher, ["handler", "path", "paths"] );
          var options = rest;
        if (path) {
          VueCompositionApi.watch(function () { return get(this$1._stores[name].value.state.value, path); }, handler, Object.assign({}, {deep: true}, options));
        } else if (paths.length > 0) {
          VueCompositionApi.watch(
            paths.map(function (p) { return function () { return get(this$1._stores[name].value.state.value, p); }; }),
            handler,
            Object.assign({}, {deep: true}, options)
          );
        } else {
          VueCompositionApi.watch(function () { return this$1._stores[name].value.state.value; }, handler, Object.assign({}, {deep: true}, options));
        }
      }
    }

    return this
  };

  TeddyStore.prototype.use = function use (plugin) {
      var this$1 = this;
      if ( plugin === void 0 ) plugin = {};

    if (typeof plugin.install === 'function') {
      plugin.install(this);
    }
    if (typeof plugin.handle === 'function') {
      Object.keys(this._stores).map(function (name) { return plugin.handle.call(this$1, { name: name, store: this$1._stores[name] }); });
    }
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

  TeddyStore.createState = function createState (newState) {
    var _state = VueCompositionApi.isReactive(newState) ? VueCompositionApi.toRefs(newState) : VueCompositionApi.isRef(newState) ? newState : VueCompositionApi.ref(newState);
    // /* Until it's made available by Vue 3, be careful with { state } as it can be deeply mutable*/
    // // const state = readonly(() => _state.value)
    var state = VueCompositionApi.computed(function () { return _state.value; });
    return { _state: _state, state: state }
  };

  TeddyStore.prototype.get = function get (name, path) {
    return TeddyStore.get(name, path, this)
  };

  TeddyStore.prototype.set = function set (name, path) {
    return TeddyStore.set(name, path, this)
  };

  TeddyStore.get = function get$1 (name, path, context) {
    context = context || this;
    return function get$1() {
      var _instance = getInstance(this, context);
      var value = get(_instance, ("stores." + name + ".value.state.value." + path), undefined, context);
      // console.log('get', path, _instance, value)
      // console.log('isComputed', utils.isComputed(_instance.stores.user.value.state))
      // watch(
      // () => _instance.stores.user.value,
      // (newState) => {
      //   console.log('newState value', newState)
      // },
      // { deep: true }
      // )
      // _instance.stores.user.value._state.value.profile.firsName = 'Teddys'

      // return _instance.stores.user.value._state.value.profile
      // console.log("get", _instance.stores.user.value._state.value);
      return value
    }
  };

  TeddyStore.set = function set$1 (name, path, context) {
    context = context || this;
    return function set$1(value) {
      console.log('set');
      var _instance = getInstance(this, context);
      set(_instance, ("stores." + name + "._state." + path), value, context);
      // console.log("_instance.stores.user.value._state.value.profile", _instance.stores.user.value._state.value.profile);
    }
  };

  TeddyStore.prototype.compute = function compute (name, path) {
    return TeddyStore.compute(name, path, this)
  };

  TeddyStore.compute = function compute (name, path, context) {
    context = context || this;
    var get = TeddyStore.get(name, path, context);
    var set = TeddyStore.set(name, path, context);
    // return computed({
    // get() {
    //   const _instance = getInstance(this, context)
    //   const value = utils.get(_instance, `stores.${name}.state.${path}`, undefined, context)
    //   console.log('value', value)
    //   return value
    // },
    // set(value) {
    //   console.log("set", name, path, value);
    //   const _instance = getInstance(this, context)
    //   utils.set(_instance, `stores.${name}._state.${path}`, value, context)
    //   console.log("get the value", utils.get(_instance, `stores.${name}.state.${path}`, undefined, context));
    // },
    // })
    return VueCompositionApi.computed({ get: get, set: set })
  };

  Object.defineProperties( TeddyStore.prototype, prototypeAccessors );

  return TeddyStore;

})));
//# sourceMappingURL=vue-teddy-store.umd.js.map
