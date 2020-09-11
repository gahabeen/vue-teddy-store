import { isRef, set as VueSet, unref } from '@vue/composition-api'
import { isObject, isValidKey, makeGet, makeHas, makePush, makeRemove, makeSet, makeUnshift, makeInsert } from 'object-string-path'
import { isComputed, isValidArrayIndex, omit } from './utils'
// import * as memoize from './memoize'

const notify = (obj = {}) => {
  const ob = obj.__ob__
  return () => {
    if (ob) {
      ob.dep.notify()
    }
  }
}

function setProp(obj, key, value) {
  const isRefed = isRef(obj)
  if (isValidArrayIndex(key) || isValidKey(key)) {
    if (isRefed) {
      VueSet(obj.value, key, value)
      return obj.value[key]
    } else {
      VueSet(obj, key, value)
      return obj[key]
    }
  } else {
    if (isRefed) {
      obj.value = value
      return obj.value
    } else {
      obj = value
      return obj
    }
  }
}

function getProp(obj, key) {
  if (isObject(obj) || Array.isArray(obj)) {
    if (isValidKey(key)) {
      if (isRef(obj)) {
        return obj.value[key]
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

  const _notify = notify(obj)

  if (Array.isArray(objValue)) {
    if (objIsRef) {
      obj.value.splice(+key, 1)
    } else {
      obj.splice(+key, 1)
    }

    _notify()
    return true
  } else if (isObject(objValue)) {
    if (objIsRef) {
      obj.value = omit(obj.value, [key])
    } else {
      delete obj[key]
    }

    _notify()
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

  const _notify = notify(target)

  if (Array.isArray(targetValue)) {
    if (targetIsRef) {
      // target.value.splice(target.value.length, 0, value)
      target.value.push(value)
      _notify()
      return target.value.slice(-1)[0]
      // return [...target.value, value]
    } else {
      target.push(value)
      _notify()
      // return [...target, value]
      // target.splice(target.length, 0, value)
      return target.slice(-1)[0]
    }
  }
}

function unshiftProp(target, value) {
  const targetValue = unref(target)
  const targetIsRef = isRef(target)
  if (Array.isArray(targetValue)) {
    if (targetIsRef) {
      // target.value.splice(0, 0, value);
      target.value.unshift(value)
      return target.value
    } else {
      // target.splice(0, 0, value);
      target.unshift(value)
      return target
    }
  }
}

function insertProp(target, index, value) {
  const targetValue = unref(target)
  const targetIsRef = isRef(target)

  const _notify = notify(target)

  if (Array.isArray(targetValue)) {
    if (targetIsRef) {
      // target.value.splice(target.value.length, 0, value)
      target.value.splice(index, 0, value)
      _notify()
      return target.value
      // return [...target.value, value]
    } else {
      target.splice(index, 0, value)
      _notify()
      // return [...target, value]
      // target.splice(target.length, 0, value)
      return target
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

export const teddyInsert = makeInsert({
  getProp,
  hasProp,
  insertProp,
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

export const insert = makeInsert({
  getProp,
  hasProp,
  insertProp,
})
