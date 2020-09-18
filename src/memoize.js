import { unref } from 'vue'
import getHash from 'object-hash'
import stringify from 'fast-safe-stringify'

const cache = {}

// NOTE: Might have some issues with Watchers.

export const getDecorated = (space, name) => {
  return (obj, steps = [], context = {}, resolvedContext = {}, getter = () => null) => {
    const path = steps.join('.')
    const hash = getHash(JSON.parse(stringify(obj, unref)))
    const contextHash = getHash(JSON.parse(stringify(resolvedContext, unref)))
    const key = `${space}/${name}//${path}//${contextHash}`
    if (hash in cache && cache[hash].has(key)) {
      // console.info(`Retrieved from cache, path: '${path}' on object's hash: '${hash}' with context's hash: '${contextHash}'`)
      return {
        cache: true,
        value: cache[hash].get(key),
      }
    } else {
      if (!(hash in cache)) cache[hash] = new Map()
      const value = getter(obj, steps, context)
      cache[hash].set(key, value)
      // console.info(`Set in cache, path: '${path}' on object's hash: '${hash}' with context's hash: '${contextHash}'`)
      return {
        cache: false,
        value,
      }
    }
  }
}

export const get = (space, name) => (obj, steps = [], context = {}, resolvedContext = {}, getter = () => null) => {
  const { value } = getDecorated(space, name)(obj, steps, context, resolvedContext, getter)
  return value
}
