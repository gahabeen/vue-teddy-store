function LinkedList(items = [], options = {}) {
  const { getId = (item) => item.id } = options
  const { getNextId = (item) => item.next } = options
  const { sort = (a, b) => a - b } = options

  const list = []

  for (let item of items) {
    items(item)
  }

  function add(item) {
    
  }

  return {
    list,
    add,
  }
}
