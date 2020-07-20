const VARIABLE_PATH = /({.+?})/gim

function resolvePath(instance) {
  return (path) => {
    const variablePath = get(instance, path.slice(1, -1).trim())
    if (['string', 'number'].includes(typeof variablePath)) {
      return variablePath
    } else {
      /* istanbul ignore next */
      throw new Error`Couldn't not find any proper value for ${variablePath}`()
    }
  }
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

export function get(obj, path, defaultValue, instance) {
  return String(path)
    .replace(/\[/g, '.')
    .replace(/]/g, '')
    .replace(VARIABLE_PATH, resolvePath(instance))
    .split('.')
    .reduce((acc, v) => {
      try {
        acc = acc[v] === undefined ? defaultValue : acc[v]
      } catch (e) {
        /* istanbul ignore next */
        return defaultValue
      }
      return acc
    }, obj)
}

export function set(obj, path, value, instance) {
  const steps = String(path)
    .replace(/\[/g, '.')
    .replace(/]/g, '')
    .replace(VARIABLE_PATH, resolvePath(instance))
    .split('.')

  const cleanStep = (key) => key.replace(/^\^/, '')

  const _set = (item, steps, val) => {
    const step = steps.shift()
    if (steps.length > 0) {
      if (Number.isInteger(+steps[0])) {
        item[step] = []
        return _set(item[step], steps, val)
      } else if (!item[step]) {
        // To force an integer as an object property, prefix it with ^
        // If somehow you want to have a ^ in a key name, double it ^^
        item[cleanStep(step)] = {}
        return _set(item[cleanStep(step)], steps, val)
      }
    } else {
      item[cleanStep(step)] = val
    }
  }

  _set(obj, steps, value)

  return obj
}
