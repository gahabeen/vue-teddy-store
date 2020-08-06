import { getStore, setWatchers, setStore } from '@/index'
import VueCompositionApi from '@vue/composition-api'
import flushPromises from 'flush-promises'
import { nanoid } from 'nanoid'
import Vue from 'vue'

Vue.use(VueCompositionApi)

describe('methods - watchers', () => {
  it('setWatchers() should create a general watcher from function', async () => {
    const space = nanoid()
    const name = nanoid()
    const store = getStore({ space, name })
    let hit = 0
    setWatchers({ space, name }, () => (hit = hit + 1))
    store.state = { newKey: 'newValue' }
    await flushPromises()
    expect(hit).toBe(1)
  })

  it('setWatchers() should create a watchers from array of functions', async () => {
    const space = nanoid()
    const name = nanoid()
    const store = getStore({ space, name })
    let hit = 0
    setWatchers({ space, name }, [
      function first() {
        hit = hit + 1
      },
      function second() {
        hit = hit + 1
      },
      function third() {
        hit = hit + 1
      },
    ])
    store.state = { newKey: 'newValue' }
    await flushPromises()
    expect(hit).toBe(3)
  })

  it('setWatchers() should create a watchers from array of objects with handlers', async () => {
    const space = nanoid()
    const name = nanoid()
    const store = getStore({ space, name })
    let hit = 0
    setWatchers({ space, name }, [
      {
        handler: function first() {
          hit = hit + 1
        },
      },
      {
        handler: function second() {
          hit = hit + 1
        },
      },
      {
        handler: function third() {
          hit = hit + 1
        },
      },
    ])
    store.state = { newKey: 'newValue' }
    await flushPromises()
    expect(hit).toBe(3)
  })

  it('setWatchers() should create a watchers from array of objects with path/handlers', async () => {
    const space = nanoid()
    const name = nanoid()

    const store = setStore(
      { space, name },
      {
        state: {
          someKey: true,
        },
      }
    )

    let hit = 0
    setWatchers({ space, name }, [
      {
        path: 'someKey',
        handler: function first() {
          hit = hit + 1
        },
      },
      {
        path: 'someKey',
        handler: function second() {
          hit = hit + 1
        },
      },
      {
        path: 'otherKey',
        handler: function third() {
          hit = hit + 1
        },
      },
    ])
    store.state.someKey = false
    await flushPromises()
    expect(hit).toBe(2)
  })

  it('setWatchers() should forbid registering same watchers twice', async () => {
    const space = nanoid()
    const name = nanoid()
    const store = getStore({ space, name })
    let hit = 0
    setWatchers({ space, name }, [
      {
        handler: () => (hit = hit + 1),
      },
    ])
    setWatchers({ space, name }, [
      {
        handler: () => (hit = hit + 1),
      },
    ])
    store.state = { newKey: 'newValue' }
    await flushPromises()
    expect(hit).toBe(1)
  })

  /**
   * TODO:
   * - setWatchers()
   * - cancel watchers
   */
})
