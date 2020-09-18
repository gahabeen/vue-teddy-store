export function resolvePath(arr) {
  return arr
    .filter(Boolean)
    .filter((item) => item.length > 0)
    .join('.')
}

export function isValidArrayIndex(val) {
  const n = parseFloat(String(val))
  return n >= 0 && Math.floor(n) === n && isFinite(val)
}
