import { getStore, setActions, get } from './../output'

export default {
  store(space, name) {
    const store = getStore({ space, name })
    if (store.features.linkedList) {
      // avoids resetting the same feature twice
      return
    }

    /**
     *  const linkedlist = $teddy.run('formsPages', 'linkedlist', { path: '', variables: { }, idPaty})
     * linkedlist.add()
     * linkedlist.remove()
     * linkedlist.update()
     */

    setActions(
      { space, name },
      {
        linkedlist(_, { path = '', variables = {}, idPath = 'id', nextPath = 'next', sortPredicate = (a, b) => 1 } = {}) {
          let _list = get(path, variables)
          if (!Array.isArray(_list) && _list && typeof _list === 'object') {
            _list = Array.values(_list)
          }

          const sortedList = []

          return {
            list: sortedList
          }
        },
      }
    )

    store.features.linkedList = true
  },
}
