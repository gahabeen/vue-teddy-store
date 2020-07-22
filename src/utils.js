const VARIABLE_PATH = /({.+?})/gim

export function resolvePath(instance) {
  return (path) => {
    path = path.slice(1, -1).trim()
    const variablePath = get(instance, path)
    if (['string', 'number'].includes(typeof variablePath)) {
      return variablePath
    } else {
      /* istanbul ignore next */
      throw new Error(`Couldn't not find any proper value for ${variablePath} at ${path}`)
    }
  }
}

export function isObject(o) {
  let ctor, prot

  function _isObject(o) {
    return Object.prototype.toString.call(o) === '[object Object]'
  }

  if (_isObject(o) === false) return false
  // If has modified constructor
  ctor = o.constructor
  if (ctor === undefined) return true
  // If has modified prototype
  prot = ctor.prototype
  if (_isObject(prot) === false) return false

  // Most likely a plain Object
  return true
}

export function isComputed(obj) {
  if (!isObject(obj) || (isObject(obj) && !('value' in obj))) {
    return false
  } else {
    const desc = Object.getOwnPropertyDescriptor(obj, 'value')
    return typeof desc.get === 'function' // && typeof desc.set === 'function'
  }
}

export function hasProp(obj, key) {
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

export function getProp(obj, key) {
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

export function get(obj, path, defaultValue, instance) {
  const steps = String(path)
    .replace(/\[/g, '.')
    .replace(/]/g, '')
    .replace(VARIABLE_PATH, resolvePath(instance))
    .split('.')

  function _get(_obj, _steps, _defaultValue) {
    if (_steps.length > 0) {
      const step = _steps.shift()
      // console.log('hasProp(_obj, step)', hasProp(_obj, step), _obj, step)
      if (hasProp(_obj, step)) {
        const stepValue = getProp(_obj, step)
        // console.log('stepValue', stepValue)
        return _get(stepValue, _steps, _defaultValue)
      } else {
        return _defaultValue
      }
    } else {
      return _obj
      // return getProp(_obj)
    }
  }

  return _get(obj, steps, defaultValue)
}

export function setProp(obj, key, value) {
  if (isComputed(obj) && key in obj.value) {
    obj.value[key] = value
    return obj.value[key]
    // } else if (Array.isArray(obj)) {
    //   obj.splice(key, 1, value)
    //   return obj[key]
  } else {
    obj[key] = value
    return obj[key]
  }
}

export function set(obj, path, value, instance) {
  const steps = String(path)
    .replace(/\[/g, '.')
    .replace(/]/g, '')
    .replace(VARIABLE_PATH, resolvePath(instance))
    .split('.')

  const cleanStep = (key) => key.replace(/^\^/, '')

  const _set = (item, steps, val) => {
    const step = cleanStep(steps.shift())
    if (steps.length > 0) {
      const nextStep = steps[0]
      // Next iteration is an array
      if (Number.isInteger(+nextStep)) {
        if (hasProp(item, step) && Array.isArray(getProp(item, step))) {
          _set(getProp(item, step), steps, val)
        } else {
          return _set(setProp(item, step, []), steps, val)
        }
      } // Else it's an object
      else {
        if (hasProp(item, step) && isObject(getProp(item, step))) {
          _set(getProp(item, step), steps, val)
        } else {
          return _set(setProp(item, step, {}), steps, val)
        }
      }
    } else {
      setProp(item, step, val)
    }
  }

  if (steps.length > 0) {
    _set(obj, steps, value)
  } else {
    // hmm
    if (obj.value) {
      obj.value = value
    } else {
      obj = value
    }
  }

  return obj
}

export function omit(obj, keys = []) {
  return Object.keys(obj).reduce((acc, key) => {
    if (!key.includes(keys)) {
      acc[key] = obj[key]
    }
    return acc
  }, {})
}

export function debounce(fn, wait = 100) {
  let timeout
  return function(...args) {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      fn.apply(this, args)
    }, wait)
  }
}
