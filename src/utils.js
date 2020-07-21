const VARIABLE_PATH = /({.+?})/gim

function resolvePath(instance) {
  return (path) => {
    const variablePath = get(instance, path.slice(1, -1).trim())
    if (['string', 'number'].includes(typeof variablePath)) {
      return variablePath
    } else {
      /* istanbul ignore next */
      throw new Error(`Couldn't not find any proper value for ${variablePath} at ${path}`)
    }
  }
}

export function isComputed(obj) {
  if (!obj || typeof obj !== 'object' || !('value' in obj)) return false
  const desc = Object.getOwnPropertyDescriptor(obj, 'value')
  return typeof desc.get === 'function' && typeof desc.set === 'function'
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

export function hasProp(obj, key) {
  if (obj && typeof obj !== 'object') {
    if (isComputed(obj) && key in obj.value) {
      return true
    } else if (key in obj) {
      return true
    } else {
      return false
    }
  } else {
    return false
  }
}

export function getProp(obj, key) {
  if (!obj || typeof obj !== 'object') return
  if (isComputed(obj) && key in obj.value) {
    return obj.value[key]
  } else if (key in obj) {
    return obj[key]
  }
}

export function get(obj, path, defaultValue, instance) {
  const steps = String(path)
    .replace(/\[/g, '.')
    .replace(/]/g, '')
    .replace(VARIABLE_PATH, resolvePath(instance))
    .split('.')

  function _get(item, steps, fallback) {
    if (steps.length > 0) {
      const step = steps.shift()
      const stepValue = getProp(item, step)
      return _get(stepValue !== undefined ? stepValue : fallback, steps, fallback)
    } else {
      return item
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
    console.log("setProp", obj, key, value);
    obj[key] = value
    return obj[key]
  }
}

export function set(obj, path, value, instance) {
  console.log("set", obj, path, value);
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
      if (!hasProp(item, step) && Number.isInteger(+nextStep)) {
        return _set(setProp(item, step, []), steps, val)
      } else if (!hasProp(item, step)) {
        // To force an integer as an object property, prefix it with ^
        // If somehow you want to have a ^ in a key name, double it ^^
        return _set(setProp(item, step, {}), steps, val)
      } else {
        return _set(getProp(item, step), steps, val)
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
