import { set, setStore } from '@/index'
import VueCompositionApi, { watch } from '@vue/composition-api'
import flushPromises from 'flush-promises'
import { nanoid } from 'nanoid'
import Vue from 'vue'

Vue.use(VueCompositionApi)

Vue.config.productionTip = false
Vue.config.devtools = false

describe('methods - accessors - set', () => {
  it('set() should set a simple path', async () => {
    const space = nanoid()
    const name = nanoid()
    const store = setStore(
      { space, name },
      {
        state: {
          products: [{ name: 'berries' }],
        },
      }
    )

    await flushPromises()
    set({ space, name }, `products`, [])
    expect(store.state.products).toEqual([])
  })

  it('set() should set a path in sub-array', async () => {
    const space = nanoid()
    const name = nanoid()
    const store = setStore(
      { space, name },
      {
        state: {
          products: [{ name: 'berries' }],
        },
      }
    )

    await flushPromises()
    set({ space, name }, `products.0`, true)
    expect(store.state.products[0]).toBe(true)
  })

  it('set() should set a path in sub-array object', async () => {
    const space = nanoid()
    const name = nanoid()
    const store = setStore(
      { space, name },
      {
        state: {
          products: [{ name: 'berries' }],
        },
      }
    )

    await flushPromises()
    set({ space, name }, `products.0.name`, true)
    expect(store.state.products[0].name).toBe(true)
  })

  it('set() should set a simple path with variable', async () => {
    const space = nanoid()
    const name = nanoid()
    const store = setStore(
      { space, name },
      {
        state: {
          products: [{ name: 'berries' }],
        },
      }
    )

    await flushPromises()
    set({ space, name }, `{key}`, [], { key: 'products' })
    expect(store.state.products).toEqual([])
  })

  it('set() should set a path in sub-array with variable', async () => {
    const space = nanoid()
    const name = nanoid()
    const store = setStore(
      { space, name },
      {
        state: {
          products: [{ name: 'berries' }],
        },
      }
    )

    await flushPromises()
    set({ space, name }, `products.{key}`, true, { key: 0 })
    expect(store.state.products[0]).toBe(true)
  })

  it('set() should set a path in sub-array object with variable', async () => {
    const space = nanoid()
    const name = nanoid()
    const store = setStore(
      { space, name },
      {
        state: {
          products: [{ name: 'berries' }],
        },
      }
    )

    await flushPromises()
    set({ space, name }, `products.0.{key}`, true, { key: 'name' })
    expect(store.state.products[0].name).toBe(true)
  })

  it('set() should set a path with key/value within an array (without brackets)', async () => {
    const space = nanoid()
    const name = nanoid()
    const store = setStore(
      { space, name },
      {
        state: {
          products: [{ id: 1, name: 'berries' }],
        },
      }
    )

    await flushPromises()
    set({ space, name }, `products.id=1`, true)
    expect(store.state.products[0]).toBe(true)
  })

  it('set() should set a path with key/value within an array (with brackets)', async () => {
    const space = nanoid()
    const name = nanoid()
    const store = setStore(
      { space, name },
      {
        state: {
          products: [{ id: 1, name: 'berries' }],
        },
      }
    )

    await flushPromises()
    set({ space, name }, `products.id=1`, true)
    expect(store.state.products[0]).toBe(true)
  })

  it('set() should set a path with key/value within an array via a variable (with brackets)', async () => {
    const space = nanoid()
    const name = nanoid()
    const store = setStore(
      { space, name },
      {
        state: {
          products: [{ id: 1, name: 'berries' }],
        },
      }
    )

    await flushPromises()
    set({ space, name }, `products[id={id}]`, true, { id: 1 })
    expect(store.state.products[0]).toBe(true)
  })

  it('set() should set a path with key/value within an array via 2 variables (with brackets)', async () => {
    const space = nanoid()
    const name = nanoid()
    const store = setStore(
      { space, name },
      {
        state: {
          products: [{ id: 1, name: 'berries' }],
        },
      }
    )

    await flushPromises()
    set({ space, name }, `products[{key}={id}]`, true, { key: 'id', id: 1 })
    expect(store.state.products[0]).toBe(true)
  })

  /* Spread operator */

  it('set() should set a spread path in sub-array', async () => {
    const space = nanoid()
    const name = nanoid()
    const state = {
      products: [{ name: 'berries' }],
    }
    const store = setStore({ space, name }, { state })

    await flushPromises()
    set({ space, name }, `products..`, null)

    await flushPromises()
    expect(store.state.products).toEqual([null])
  })

  it('set() should set a spread (with star) path in sub-array', async () => {
    const space = nanoid()
    const name = nanoid()
    const state = {
      products: [{ name: 'berries' }],
    }
    const store = setStore({ space, name }, { state })

    await flushPromises()
    set({ space, name }, `products.*`, null)

    await flushPromises()
    expect(store.state.products).toEqual([null])
  })

  it('set() should set a spread path in sub-array path', async () => {
    const space = nanoid()
    const name = nanoid()
    const state = {
      products: [{ name: 'berries' }],
    }
    const store = setStore({ space, name }, { state })

    await flushPromises()
    set({ space, name }, `products..name`, null)

    await flushPromises()
    expect(store.state.products).toEqual([{ name: null }])
  })

  it('set() should set a spread (with star) path in sub-array path', async () => {
    const space = nanoid()
    const name = nanoid()
    const state = {
      products: [{ name: 'berries' }],
    }
    const store = setStore({ space, name }, { state })

    await flushPromises()
    set({ space, name }, `products.*.name`, null)

    await flushPromises()
    expect(store.state.products).toEqual([{ name: null }])
  })

  it('set() should set a spread path in sub-object', async () => {
    const space = nanoid()
    const name = nanoid()
    const state = {
      products: { 1: { name: 'berries' } },
    }
    const store = setStore({ space, name }, { state })

    await flushPromises()
    set({ space, name }, `products..`, null)

    await flushPromises()
    expect(store.state.products).toEqual({ 1: null })
  })

  it('set() should set a spread (with star) path in sub-object', async () => {
    const space = nanoid()
    const name = nanoid()
    const state = {
      products: { 1: { name: 'berries' } },
    }
    const store = setStore({ space, name }, { state })

    await flushPromises()
    set({ space, name }, `products.*`, null)

    await flushPromises()
    expect(store.state.products).toEqual({ 1: null })
  })

  it('set() should set a spread path in sub-object path', async () => {
    const space = nanoid()
    const name = nanoid()
    const state = {
      products: { 1: { name: 'berries' } },
    }
    const store = setStore({ space, name }, { state })

    await flushPromises()
    set({ space, name }, `products..name`, null)

    await flushPromises()
    expect(store.state.products).toEqual({ 1: { name: null } })
  })

  it('set() should set a spread (with star) path in sub-object path', async () => {
    const space = nanoid()
    const name = nanoid()
    const state = {
      products: { 1: { name: 'berries' } },
    }
    const store = setStore({ space, name }, { state })

    await flushPromises()
    set({ space, name }, `products.*.name`, null)

    await flushPromises()
    expect(store.state.products).toEqual({ 1: { name: null } })
  })

  it('set() should fire a watchable update on root on 1-step path', async () => {
    const space = nanoid()
    const name = nanoid()
    const state = {
      products: [],
    }
    const store = setStore({ space, name }, { state })

    let hit = 0

    watch(store.state, () => {
      hit = hit + 1
    })

    await flushPromises()
    set({ space, name }, 'products', [{ name: 'honey' }])
    await flushPromises()
    expect(hit).toEqual(1)
  })

  it('set() should fire a watchable update on root on 2-step path', async () => {
    const space = nanoid()
    const name = nanoid()
    const state = {
      categories: {
        first: {
          products: [],
        },
      },
    }
    const store = setStore({ space, name }, { state })

    let hit = 0

    watch(store.state, () => {
      hit = hit + 1
    })

    await flushPromises()
    set({ space, name }, 'categories.first', { others: [] })
    await flushPromises()
    expect(hit).toEqual(1)
  })

  it('set() should fire a watchable update on root on 3-step path', async () => {
    const space = nanoid()
    const name = nanoid()
    const state = {
      categories: {
        first: {
          products: [],
        },
      },
    }
    const store = setStore({ space, name }, { state })

    let hit = 0

    watch(store.state, () => {
      hit = hit + 1
    })

    await flushPromises()
    set({ space, name }, 'categories.first.products', [{ name: 'top' }])
    await flushPromises()
    expect(hit).toEqual(1)
  })

  it('set() should set a deep path value on unexisting objects', async () => {
    const space = nanoid()
    const name = nanoid()
    const state = {
      products: {},
    }
    const store = setStore({ space, name }, { state })

    await flushPromises()
    set({ space, name }, `products.that.is.really.deep`, null)

    await flushPromises()
    expect(store.state.products).toHaveProperty('that.is.really.deep', null)
  })
})
