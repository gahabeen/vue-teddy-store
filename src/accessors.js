import { isRef, unref } from '@vue/composition-api'
import { isObject, isValidKey, makeGet, makeHas, makeSet, makeRemove, makePush, makeUnshift } from 'object-string-path'
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

function pushProp(target, value) {
  const targetValue = unref(target)
  const targetIsRef = isRef(target)
  console.log({ target, value })
  if (Array.isArray(targetValue)) {
    if (targetIsRef) {
      target.value.push(value)
      return target.value.slice(-1)[0]
    } else {
      target.push(value)
      return target.slice(-1)[0]
    }
  }
}

function unshiftProp(target, value) {
  const targetValue = unref(target)
  const targetIsRef = isRef(target)
  if (Array.isArray(targetValue)) {
    if (targetIsRef) {
      target.value.unshift(value)
      return target.value[0]
    } else {
      target.unshift(value)
      return target[0]
    }
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

export const teddyGet = makeGet({
  getProp,
  hasProp,
  afterGetSteps,
  // proxy: memoize.get(space, name),
})

export const teddyRemove = makeRemove({
  getProp,
  hasProp,
  removeProp,
  afterGetSteps,
})

export const teddyPush = makePush({
  getProp,
  hasProp,
  pushProp,
  afterGetSteps,
})

export const teddyUnshift = makeUnshift({
  getProp,
  hasProp,
  unshiftProp,
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
  getProp,
  hasProp,
})

export const push = makePush({
  getProp,
  hasProp,
  pushProp,
})

export const unshift = makeUnshift({
  getProp,
  hasProp,
  unshiftProp,
})
