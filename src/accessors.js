import { isRef, unref, set as vueCompSet } from '@vue/composition-api'
import { isObject, isValidKey, makeGet, makeHas, makeSet, makeRemove } from 'object-string-path'
import { isComputed, omit } from './utils'
// import * as memoize from './memoize'

function setProp(obj, key, value) {
  if (isObject(obj) || Array.isArray(obj)) {
    if (isValidKey(key)) {
      try {
        vueCompSet(unref(obj), key, value)
      } catch (error) {
        console.error(`Couldn't not set value: ${{ obj, key, value }}`)
      }
      return unref(obj)[key]
    } else {
      if (isRef(obj)) {
        obj.value = value
      } else {
        obj = value
      }
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
          return obj.value
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

function removeProp(_, parent, parentPath, key) {
  const parentValue = unref(parent)
  const parentIsRef = isRef(parent)
  if (Array.isArray(parentValue)) {
    if (parentIsRef) {
      parent.value.splice(+key, 1)
    } else {
      parent.splice(+key, 1)
    }
    return true
  } else if (isObject(parentValue)) {
    if (parentIsRef) {
      parent.value = omit(parent.value, [key])
    } else {
      delete parent[key]
    }
    if (parentPath.length > 0) {
      // important for Vue reactivity after key deleted
      // teddySet(obj, parentPath, { ...(parentIsRef ? parent.value : parent) }, context)
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

export const teddyGet = (space, name) =>
  makeGet({
    getProp,
    hasProp,
    afterGetSteps,
    // proxy: memoize.get(space, name),
  })

export const teddyRemove = (space, name) =>
  makeRemove({
    get: teddyGet(space, name),
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
