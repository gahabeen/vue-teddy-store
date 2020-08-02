import { isObject, isValidKey, makeGet, makeHas, makeSet } from 'object-string-path'
import { isComputed } from './utils'
import * as memoize from './memoize'

function setProp(obj, key, value) {
  if (isValidKey(key) && (isObject(obj) || Array.isArray(obj))) {
    if (isComputed(obj) && 'value' in obj && key in obj.value) {
      obj.value[key] = value
      return obj.value[key]
    } else if (Array.isArray(obj)) {
      obj.splice(+key, 1, value)
      // obj[key] = value;
      return obj[key]
    } else if (isObject(obj)) {
      obj[key] = value
      return obj[key]
    }
  } else if (obj && key == undefined) {
    if (isComputed(obj) && 'value' in obj) {
      obj.value = value
    } else if (isObject(value)) {
      Object.assign(obj, value)
    } else {
      obj = value
    }
    return obj
  } else {
    console.warn(`Couldn't not set ${key}`)
    return
  }
}

function getProp(obj, key) {
  if (isValidKey(key)) {
    if (isComputed(obj)) {
      if (key in obj.value) {
        return obj.value[key]
      } else {
        return obj.value
      }
    } else if (isObject(obj) || Array.isArray(obj)) {
      return obj[key]
    }
  } else if (obj && key === undefined) {
    if (isComputed(obj)) {
      return obj.value
    } else {
      return obj
    }
  } else {
    return // error
  }
}

function hasProp(obj, key) {
  if (!isObject(obj) && !Array.isArray(obj)) {
    return false
  } else if (isValidKey(key)) {
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

function afterGetSteps(steps = []) {
  return ['_state', ...steps]
}

export const teddySet = makeSet({
  setProp,
  getProp,
  hasProp,
  afterGetSteps,
})

export const teddyHas = makeHas({
  getProp,
  hasProp,
  afterGetSteps,
})

export const teddyGet = makeGet({
  getProp,
  hasProp,
  afterGetSteps,
  proxy: memoize.get,
})

export const set = makeSet({
  setProp,
  getProp,
  hasProp,
})

export const has = makeHas({
  getProp,
  hasProp,
})

export const get = makeGet({
  getProp,
  hasProp,
})
