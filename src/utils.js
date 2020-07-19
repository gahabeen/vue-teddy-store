const VARIABLE_PATH = /({.+?})/gim

function resolvePath(instance) {
  return (path) => {
    const variablePath = get(path.slice(1, -1), instance)
    if (['string', 'number'].includes(typeof variablePath)) {
      return variablePath
    } else {
      throw new Error`Couldn't not find any proper value for ${variablePath}`()
    }
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

  const _set = (item, steps, val) => {
    const step = steps.shift()
    if (steps.length > 0) {
      if (Number.isInteger(+steps[0])) {
        item[step] = []
      } else if (!item[step]) {
        // To force an integer as an object property, prefix it with ^
        // If somehow you want to have a ^ in a key name, double it ^^
        item[step.replace(/^\^/, '')] = {}
      }
      return _set(item[step], steps, val)
    } else {
      item[step] = val
    }
  }

  _set(obj, steps, value)

  return obj
}
