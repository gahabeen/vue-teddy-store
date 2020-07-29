import { getTeddyStore, makeWatchers, setStore } from '@/index'
import VueCompositionApi from '@vue/composition-api'
import flushPromises from 'flush-promises'
import { nanoid } from 'nanoid'
import Vue from 'vue'

Vue.use(VueCompositionApi)

describe('methods - watchers', () => {
  it('makeWatchers() should create a general watcher from function', async () => {
    const space = nanoid()
    const name = nanoid()
    const store = getTeddyStore({ space, name })
    let hit = 0
    makeWatchers({ space, name }, () => (hit = hit + 1))
    store.state = { newKey: 'newValue' }
    await flushPromises()
    expect(hit).toBe(1)
  })

  it('makeWatchers() should create a watchers from array of functions', async () => {
    const space = nanoid()
    const name = nanoid()
    const store = getTeddyStore({ space, name })
    let hit = 0
    makeWatchers({ space, name }, [() => (hit = hit + 1), () => (hit = hit + 1), () => (hit = hit + 1)])
    store.state = { newKey: 'newValue' }
    await flushPromises()
    expect(hit).toBe(3)
  })

  it('makeWatchers() should create a watchers from array of objects with handlers', async () => {
    const space = nanoid()
    const name = nanoid()
    const store = getTeddyStore({ space, name })
    let hit = 0
    makeWatchers({ space, name }, [
      {
        handler: () => (hit = hit + 1),
      },
      {
        handler: () => (hit = hit + 1),
      },
      {
        handler: () => (hit = hit + 1),
      },
    ])
    store.state = { newKey: 'newValue' }
    await flushPromises()
    expect(hit).toBe(3)
  })

  it('makeWatchers() should create a watchers from array of objects with path/handlers', async () => {
    const space = nanoid()
    const name = nanoid()

    const store = setStore({ space, name }, {
      state: {
        someKey: true,
      },
    })

    let hit = 0
    makeWatchers({ space, name }, [
      {
        path: 'someKey',
        handler: () => (hit = hit + 1),
      },
      {
        path: 'someKey',
        handler: () => (hit = hit + 1),
      },
      {
        path: 'otherKey',
        handler: () => (hit = hit + 1),
      },
    ])
    store.state.someKey = false
    await flushPromises()
    expect(hit).toBe(2)
  })

  /**
   * TODO:
   * - setWatchers()
   * - cancel watchers
   */
})
