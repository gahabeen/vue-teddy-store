import { isRef, unref } from '@vue/composition-api'
import { isObject, isValidKey, makeGet, makeHas, makeSet, makeRemove } from 'object-string-path'
import { isComputed, isArray, omit, isValidArrayIndex } from './utils'
// import * as memoize from './memoize'

function setProp(obj, key, value) {
  const _obj = unref(obj)
  const isRefed = isRef(obj)
  if (isArray(_obj) && isValidArrayIndex(key)) {
    _obj.length = Math.max(_obj.length, key)
    if (isRefed) {
      obj.value.splice(key, 1, value)
    } else {
      obj.splice(key, 1, value)
    }
  } else if (isValidKey(key) && isObject(_obj)) {
    if (isRefed) {
      obj.value[key] = value
    } else {
      obj[key] = value
    }
  } else {
    if (isRefed) {
      obj.value = value
    } else {
      obj = value
    }
  }
}

function getProp(obj, key) {
  if (isObject(obj) || Array.isArray(obj)) {
    if (isValidKey(key)) {
      if (isRef(obj)) {
        if (key in obj.value) {
          return obj.value[key]
        } else {
          return
          // return obj.value
        }
      } else {
        return obj[key]
      }
    } else {
      if (isRef(obj)) {
        return obj.value
      } else {
        return obj
      }
    }
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

function removeProp(obj, key) {
  const objValue = unref(obj)
  const objIsRef = isRef(obj)
  if (Array.isArray(objValue)) {
    if (objIsRef) {
      obj.value.splice(+key, 1)
    } else {
      obj.splice(+key, 1)
    }
    return true
  } else if (isObject(objValue)) {
    if (objIsRef) {
      obj.value = omit(obj.value, [key])
    } else {
      delete obj[key]
    }
    return true
  } else {
    // nothing can be done?
    // Handle more types
    return false
  }
}

function afterGetSteps(steps = []) {
  return steps[0] !== '_state' ? ['_state', ...steps] : steps
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

export const teddyGet = () =>
  // space, name
  makeGet({
    getProp,
    hasProp,
    afterGetSteps,
    // proxy: memoize.get(space, name),
  })

export const teddyRemove = () =>
  // space, name
  makeRemove({
    // TODO: This uses afterGetSteps in the teddyGet
    // Seek for a solution when memoize will be activated
    // get: teddyGet(space, name),
    getProp,
    hasProp,
    removeProp,
    afterGetSteps,
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

export const remove = makeRemove({
  get,
  getProp,
  hasProp,
})
