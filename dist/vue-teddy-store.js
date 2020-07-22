/*!
  * vue-teddy-store v0.1.22
  * (c) 2020 Gabin Desserprit
  * @license MIT
  */
var VueTeddyStore = (function (compositionApi) {
  'use strict';

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
        compositionApi.watch(
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
      store._history = compositionApi.reactive([]);
      compositionApi.watch(
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
            store.state = compositionApi.reactive({ ...store.state, ...JSON.parse(e.newValue) });
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

  const VARIABLE_PATH = /({.+?})/gim;
  const VALUE_PATH = /('.+?')/gim;

  function resolveDynamicPath(context, parent) {
    return (_path) => {
      // const [path, modifier] = _path
      const path = _path
        .replace(/>/gim, '.')
        .slice(1, -1)
        .trim();
        // .split('|')

      // if pick by key:value
      if (path.includes(':')) {
        const keyValue = path
          .split(':')
          .filter(Boolean)
          .map((p) => p.trim())
          .map((el) => {
            if (el.match(VALUE_PATH)) {
              return el.slice(1, -1).trim()
            } else {
              return resolveDynamicPath(context, parent)(`{${el}}`)
            }
          });

        if (keyValue.length === 2) {
          const [key, value] = keyValue;
          const variablePath = getKeyByKeyValue(parent, key, value);
          if (variablePath !== undefined) {
            return variablePath
          } else {
            /* istanbul ignore next */
            throw new Error(`Couldn't not find any proper variablePath for ${path} and ${keyValue}`)
          }
        } else {
          /* istanbul ignore next */
          throw new Error(`Couldn't not find any proper keyValue for ${path}`)
        }
      }
      // else only variable path
      else {
        const variablePath = get(context, path);
        if (['string', 'number'].includes(typeof variablePath)) {
          return variablePath
        } else {
          /* istanbul ignore next */
          throw new Error(`Couldn't not find any proper value for ${variablePath} at ${path}`)
        }
      }
    }
  }

  function isObject(o) {
    let ctor, prot;

    function _isObject(o) {
      return Object.prototype.toString.call(o) === '[object Object]'
    }

    if (_isObject(o) === false) return false
    // If has modified constructor
    ctor = o.constructor;
    if (ctor === undefined) return true
    // If has modified prototype
    prot = ctor.prototype;
    if (_isObject(prot) === false) return false

    // Most likely a plain Object
    return true
  }

  function isComputed(obj) {
    if (!isObject(obj) || (isObject(obj) && !('value' in obj))) {
      return false
    } else {
      const desc = Object.getOwnPropertyDescriptor(obj, 'value');
      return typeof desc.get === 'function' // && typeof desc.set === 'function'
    }
  }

  function hasProp(obj, key) {
    if (!isObject(obj) && !Array.isArray(obj)) {
      return false
    } else if (isComputed(obj) && key in obj.value) {
      return true
    } else if (key in obj) {
      return true
    } else {
      return false
    }
  }

  function getProp(obj, key) {
    if (!isObject(obj) && !Array.isArray(obj)) return
    if (isComputed(obj)) {
      if (key && key in obj.value) {
        return obj.value[key]
      } else {
        return obj.value
      }
    } else if (key && key in obj) {
      return obj[key]
    } else {
      return obj
    }
  }

  function getKeyByKeyValue(iterable, key, value) {
    for (let prop of Object.keys(iterable)) {
      if (isObject(iterable[prop]) && iterable[prop][key] == value) {
        return prop
      }
    }
  }

  function get(obj, path, context) {
    const steps = String(path)
      .replace(/\[/g, '.')
      .replace(/]/g, '')
      .replace(VARIABLE_PATH, function(text) {
        return text.replace(/\./gim, '>')
      })
      .split('.');

    function _get(_obj, _steps) {
      if (_steps.length > 0) {
        const step = _steps.shift().replace(VARIABLE_PATH, resolveDynamicPath(context, _obj));
        // console.log('hasProp(_obj, step)', hasProp(_obj, step), _obj, step)
        if (hasProp(_obj, step)) {
          const stepValue = getProp(_obj, step);
          // console.log('stepValue', stepValue)
          return _get(stepValue, _steps)
        } else {
          return
        }
      } else {
        return _obj
        // return getProp(_obj)
      }
    }

    return _get(obj, steps)
  }

  function setProp(obj, key, value) {
    if (isComputed(obj) && key in obj.value) {
      obj.value[key] = value;
      return obj.value[key]
      // } else if (Array.isArray(obj)) {
      //   obj.splice(key, 1, value)
      //   return obj[key]
    } else {
      obj[key] = value;
      return obj[key]
    }
  }

  function set(obj, path, value, context) {
    const steps = String(path)
      .replace(/\[/g, '.')
      .replace(/]/g, '')
      .replace(VARIABLE_PATH, function(text) {
        return text.replace(/\./gim, '>')
      })
      .split('.');

    const cleanStep = (key) => key.replace(/^\^/, '');

    const _set = (item, steps, val) => {
      const step = cleanStep(steps.shift()).replace(VARIABLE_PATH, resolveDynamicPath(context, item));
      if (steps.length > 0) {
        const nextStep = steps[0].replace(VARIABLE_PATH, resolveDynamicPath(context, item));
        // Next iteration is an array
        if (Number.isInteger(+nextStep)) {
          if (hasProp(item, step) && Array.isArray(getProp(item, step))) {
            _set(getProp(item, step), steps, val);
          } else {
            return _set(setProp(item, step, []), steps, val)
          }
        } // Else it's an object
        else {
          if (hasProp(item, step) && isObject(getProp(item, step))) {
            _set(getProp(item, step), steps, val);
          } else {
            return _set(setProp(item, step, {}), steps, val)
          }
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

  function omit(obj, keys = []) {
    return Object.keys(obj).reduce((acc, key) => {
      if (!key.includes(keys)) {
        acc[key] = obj[key];
      }
      return acc
    }, {})
  }

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
      const others = omit(store, ['state', 'methods', 'watchers']);

      this._stores[name] = {
        ...TeddyStore.createState(store.state),
        ...(store.methods || {}),
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
          compositionApi.watch(() => this._stores[name].state.value, watcher, { deep: true });
        } else if (watcher && typeof watcher === 'object' && 'handler' in watcher) {
          const { handler, path, paths = [], ...options } = watcher;
          if (path) {
            compositionApi.watch(() => get(this._stores[name].state.value, path), handler, { deep: true, ...options });
          } else if (paths.length > 0) {
            compositionApi.watch(
              paths.map((p) => () => get(this._stores[name].state.value, p)),
              handler,
              { deep: true, ...options }
            );
          } else {
            compositionApi.watch(() => this._stores[name].state.value, handler, { deep: true, ...options });
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
      if (compositionApi.isRef(state)) {
        return state
        // } else if (isReactive(state)) {
        //   return toRef(state)
      } else {
        return compositionApi.ref(state)
      }
    }

    get(name, path) {
      return TeddyStore.get(name, path, this)
    }

    static get(name, path, context) {
      context = context || this;
      return function get$1() {
        const _instance = getInstance(this, context);
        const _context = getContext(this, context);
        const value = get(_instance, `_stores.${name}.state.${path}`, _context);
        return value
      }
    }

    set(name, path) {
      return TeddyStore.set(name, path, this)
    }

    static set(name, path, context) {
      context = context || this;
      return function set$1(value) {
        const _instance = getInstance(this, context);
        const _context = getContext(this, context);
        set(_instance, `_stores.${name}.state.${path}`, value, _context);
      }
    }

    compute(name, path) {
      return TeddyStore.compute(name, path, this)
    }

    static _compute(name, path, context) {
      context = context || this;
      const get = TeddyStore.get(name, path, context);
      const set = TeddyStore.set(name, path, context);
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

  return TeddyStore;

}(vueCompositionApi));
