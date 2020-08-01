import getHash from 'object-hash'

// const unreactive = (obj) => {
//   return Object.keys({ root: obj }).reduce((acc, key) => {
//     if (Array.isArray(obj[key])) {
//       acc[key] = [...obj[key].map(unreactive)]
//     } else if (isObject(obj[key])) {
//       acc[key] = unreactive({ ...obj[key] })
//     } else {
//       acc[key] = obj[key]
//     }
//     return acc
//   }).root
// }

const cache = {}

// NOTE: Might have some issues with Watchers. 

export const get = (obj, path = '', context = {}, getter = () => null) => {
  const hash = getHash(JSON.parse(JSON.stringify(obj)))
  const contextHash = getHash(context)
  const key = `${path}//${contextHash}`
  if (hash in cache && cache[hash].has(key)) {
    // console.info(`Retrieved from cache, path: '${path}' on object's hash: '${hash}' with context's hash: '${contextHash}'`)
    return cache[hash].get(key)
  } else {
    if (!(hash in cache)) cache[hash] = new Map()
    const value = getter(obj, path, context)
    cache[hash].set(key, value)
    // console.info(`Set in cache, path: '${path}' on object's hash: '${hash}' with context's hash: '${contextHash}'`)
    return value
  }
}
