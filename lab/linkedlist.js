function LinkSegment(items = []) {
  return {
    list: items,
    get size() {
      return this.list.length
    },
    memoize: {
      id: {},
      nextId: {},
    },
    matchId(nextId) {
      if (nextId) {
        if (nextId in this.memoize.id) {
          return this.memoize.id[nextId]
        } else {
          this.memoize.id[nextId] = !!this.list.find((item) => item.id === nextId)
        }
        return this.memoize.id[nextId]
      }
    },
    matchNextId(id) {
      if (id) {
        if (id in this.memoize.nextId) {
          return this.memoize.nextId[id]
        } else {
          this.memoize.nextId[id] = !!this.list.find((item) => item.nextId === id)
        }
        return this.memoize.nextId[id]
      }
    },
    add(nextId, id, ts) {
      const index = this.list.findIndex((item) => item.id === nextId)
      if (index > -1) {
        this.list.splice(index, 0, { id, nextId, ts })
        return true
      } else {
        return false
      }
    },
    remove(id) {
      const index = this.list.findIndex((item) => item.id === id)
      if (index > -1) {
        this.list.splice(index, 1)
      }
    },
  }
}

function LinkSegments() {
  return {
    _list: [],
    add(nextId, id, ts) {
      if (nextId) {
        for (let segment of this._list) {
          if (segment.matchId(nextId)) {
            return segment.add(nextId, id, ts)
          }
        }
      }
      this._list.push(LinkSegment([{ id, nextId, ts }]))
    },
    stitch() {
      // const sortedSegments = this._list.sort((a, b) => b.size - a.size)
      // for (let [segmentIndex, stitchedSegment] of Object.entries(sortedSegments)) {
      //   let changed = false
      //   do {
      //     for (let segment of sortedSegments.filter((_, index) => index !== segmentIndex)) {
      //       for (let item of segment.list) {
      //         if (stitchedSegment.matchId(item.nextId)) {
      //           stitchedSegment.add(item.nextId, item.id)
      //           segment.remove(item.id)
      //           changed = changed && true
      //         }
      //       }
      //     }
      //   } while (changed)
      // }
    },
  }
}

function LinkedList(list = [], options) {
  const { getId = (item) => item.id } = options
  const { getNextId = (item) => item.next } = options
  const { getTimestamp = (item) => new Date(item.createdAt).getTime() } = options

  function init() {
    const ids = list.map(getId)
    const segments = LinkSegments()
    const unsorted = []

    for (let node of list) {
      const nodeId = getId(node)
      const nextId = getNextId(node)
      const nextIdExists = ids.includes(nextId)
      segments.add(nextIdExists ? nextId : null, nodeId, getTimestamp(node))
    }

    segments.stitch()

    return {
      segments,
      unsorted,
    }
  }

  return {
    list: init(list),
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

console.log(
  JSON.stringify(
    LinkedList(arr, {
      getNextId: (node) => node.next.id,
      sort(a, b) {
        return new Date(b.createdAt) - new Date(a.createdAt)
      },
    }),
    null,
    2
  )
)
