function LinkedList(items = [], options = {}) {
  const { getId = (item) => item.id } = options
  const { getNextId = (item) => item.next } = options
  const { setNextId = (item, nextId) => (item.next = nextId) } = options

  function init(list) {
    const ids = list.map(getId)
    const registry = new Map()
    const sorted = []
    const unsorted = new Map()
    let cursor = null

    // prepare the items
    for (let idx = 0; idx < list.length; idx++) {
      const item = list[idx]
      if (getNextId(item) == undefined || !ids.includes(getNextId(item))) {
        item.next = null
        unsorted.set(getId(item), idx)
      } else {
        registry.set(getNextId(item), idx)
      }
    }

    // select the starter
    for (let [id] of Array.from(unsorted)) {
      if (registry.has(id)) {
        cursor = id
        sorted.push(list[unsorted.get(id)])
        unsorted.delete(id)
        break
      }
    }

    // sort the list
    while (cursor) {
      const nextItem = list[registry.get(cursor)]
      if (nextItem) {
        sorted.push(nextItem)
        registry.delete(cursor)
        cursor = getId(nextItem)
      } else {
        cursor = null
      }
    }

    // retrieve remaining unsorted
    const lost = [...Array.from(registry), ...Array.from(unsorted)].map(([_, idx]) => list[idx])

    return {
      list: sorted.reverse(),
      lost,
    }
  }

  return {
    ...init(items),
    reload() {
      const { list, lost } = init(this.list)
      this.list = list
      this.lost = lost
      return this
    },
    referencePreviousItem(item, previous) {
      setNextId(previous, getId(item))
      return this
    },
    referenceNextItem(item, next) {
      setNextId(item, getId(next))
      return this
    },
    push(item) {
      const lastItem = this.list[this.list.length - 1]
      this.referencePreviousItem(item, lastItem)
      this.list.push(item)
      return this
    },
    unshift(item) {
      const firstItem = this.list[0]
      this.referenceNextItem(item, firstItem)
      this.list.unshift(item)
      return this
    },
    insert(item, index) {
      const previousItem = this.list[index - 1]
      const nextItem = this.list[index]

      if (previousItem) {
        this.referencePreviousItem(item, previousItem)
      }

      if (nextItem) {
        this.referenceNextItem(item, nextItem)
      }

      this.list.splice(index, 0, item)
      return this
    },
    remove(index) {
      const previousItem = this.list[index - 1]
      const nextItem = this.list[index]

      if (previousItem) {
        this.referencePreviousItem(nextItem, previousItem)
      }

      this.list.splice(index, 1)
      return this
    },
  }
}

const arr = [
  {
    id: 'ckevjufyz00g208l9a744dlj4',
    label: '2',
    next: { id: 'ckewml8s300si08l458muh3yg' },
  },
  {
    id: 'ckewml8s300si08l458muh3yg',
    label: '3',
    next: { id: 'ckewnti8v004407l8choac8ul' },
  },
  {
    id: 'ckev7rb0f001607lj0xkx1f6s',
    label: '1',
    next: { id: 'ckevjufyz00g208l9a744dlj4' },
  },
  {
    id: 'ckewnti8v004407l8choac8ul',
    label: '4',
    next: { id: 'ckewpdf1c002q08kz6be6a5il' }, //
  },
]

const LL = LinkedList(arr, {
  getNextId: (node) => (node.next && node.next.id ? node.next.id : null),
  setNextId: (node, nextId) => {
    if (!node.next) {
      node.next = {}
    }
    node.next.id = nextId
  },
})

console.log(
  JSON.stringify(
    // LL.list,
    // .reload()
    LL.insert(
      {
        id: '123',
      },
      2
    ).remove(2).list,
    null,
    2
  )
)
