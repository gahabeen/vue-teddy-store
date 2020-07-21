import Vue from 'vue';
import VueCompositionApi, { watch, reactive, isReactive, toRef, isRef, ref, computed } from '@vue/composition-api';

Vue.use(VueCompositionApi);

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
      return _get(stepValue, steps, fallback)
    } else {
      return item
    }
  }

  return _get(obj, steps, defaultValue)
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

function set(obj, path, value, instance) {
  var steps = String(path)
    .replace(/\[/g, '.')
    .replace(/]/g, '')
    .replace(VARIABLE_PATH, resolvePath(instance))
    .split('.');

  var cleanStep = function (key) { return key.replace(/^\^/, ''); };

  var _set = function (item, steps, val) {
    var step = cleanStep(steps.shift());
    if (steps.length > 0) {
      if (!hasProp(item, step)) {
        var nextStep = steps[0];
        if (Number.isInteger(+nextStep)) {
          return _set(setProp(item, step, []), steps, val)
        } else {
          // To force an integer as an object property, prefix it with ^
          // If somehow you want to have a ^ in a key name, double it ^^
          return _set(setProp(item, step, {}), steps, val)
        }
      } else {
        return _set(getProp(item, step), steps, val)
      }
    } else {
      setProp(item, step, val);
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
      watch(
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

    store._history = reactive([]);
    watch(
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
          store._state = reactive(Object.assign({}, store._state, JSON.parse(e.newValue)));
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

  var others = omit(store, ['state', 'methods', 'watchers']);

  this._stores[name] = Object.assign({}, {state: TeddyStore.createState(store.state)},
    (store.methods || {}),
    others);

  var watchers = [];
  if (Array.isArray(store.watchers)) {
    watchers.push.apply(watchers, store.watchers);
  } else if (store.watcher) {
    watchers.push(store.watcher);
  }

  for (var watcher of watchers) {
    if (typeof watcher === 'function') {
      watch(function () { return this$1._stores[name].state.value; }, watcher, { deep: true });
    } else if (watcher && typeof watcher === 'object' && 'handler' in watcher) {
      var handler = watcher.handler;
        var path = watcher.path;
        var paths = watcher.paths; if ( paths === void 0 ) paths = [];
        var rest = objectWithoutProperties( watcher, ["handler", "path", "paths"] );
        var options = rest;
      if (path) {
        watch(function () { return get(this$1._stores[name].state.value, path); }, handler, Object.assign({}, {deep: true}, options));
      } else if (paths.length > 0) {
        watch(
          paths.map(function (p) { return function () { return get(this$1._stores[name].state.value, p); }; }),
          handler,
          Object.assign({}, {deep: true}, options)
        );
      } else {
        watch(function () { return this$1._stores[name].state.value; }, handler, Object.assign({}, {deep: true}, options));
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
  VueInstance.prototype.$teddy = this;
};

prototypeAccessors.stores.get = function () {
  return this._stores
};

TeddyStore.createState = function createState (newState) {
  return isReactive(newState) ? toRef(newState) : isRef(newState) ? newState : ref(newState)
};

TeddyStore.prototype.get = function get (name, path) {
  return TeddyStore.get(name, path, this)
};

TeddyStore.get = function get$1 (name, path, context) {
  context = context || this;
  return function get$1() {
    var _instance = getInstance(this, context);
    return get(_instance, ("stores." + name + ".value.state.value." + path), undefined, context)
  }
};

TeddyStore.prototype.set = function set (name, path) {
  return TeddyStore.set(name, path, this)
};

TeddyStore.set = function set$1 (name, path, context) {
  context = context || this;
  return function set$1(value) {
    var _instance = getInstance(this, context);
    set(_instance, ("stores." + name + ".state." + path), value, context);
  }
};

TeddyStore.prototype.compute = function compute (name, path) {
  return TeddyStore.compute(name, path, this)
};

TeddyStore.compute = function compute (name, path, context) {
  context = context || this;
  var get = TeddyStore.get(name, path, context);
  var set = TeddyStore.set(name, path, context);
  return computed({ get: get, set: set })
};

Object.defineProperties( TeddyStore.prototype, prototypeAccessors );

export default TeddyStore;
//# sourceMappingURL=vue-teddy-store.esm.js.map
