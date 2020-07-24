import { isObject } from 'object-string-path'

export function isComputed(obj) {
  if (!isObject(obj) || (isObject(obj) && !('value' in obj))) {
    return false
  } else {
    const desc = Object.getOwnPropertyDescriptor(obj, 'value')
    return typeof desc.get === 'function' // && typeof desc.set === 'function'
  }
}

export function omit(obj, keys = []) {
  return Object.keys(obj).reduce((acc, key) => {
    if (!keys.includes(key)) {
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

export function resolvePath(arr) {
  return arr.filter(Boolean).filter((item) => item.length > 0).join('.')
}
