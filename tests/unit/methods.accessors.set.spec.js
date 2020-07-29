import { set, setStore } from '@/index'
import VueCompositionApi from '@vue/composition-api'
import flushPromises from 'flush-promises'
import { nanoid } from 'nanoid'
import Vue from 'vue'

Vue.use(VueCompositionApi)

describe('methods - setors - set', () => {
  it('set() should set a simple path', async () => {
    const space = nanoid()
    const name = nanoid()
    const store = setStore({ space, name }, {
      state: {
        products: [{ name: 'berries' }],
      },
    })

    await flushPromises()
    set({ space, name }, `products`, [])
    expect(store.state.products).toEqual([])
  })

  it('set() should set a path in sub-array', async () => {
    const space = nanoid()
    const name = nanoid()
    const store = setStore({ space, name }, {
      state: {
        products: [{ name: 'berries' }],
      },
    })

    await flushPromises()
    set({ space, name }, `products.0`, true)
    expect(store.state.products[0]).toBe(true)
  })

  it('set() should set a path in sub-array object', async () => {
    const space = nanoid()
    const name = nanoid()
    const store = setStore({ space, name }, {
      state: {
        products: [{ name: 'berries' }],
      },
    })

    await flushPromises()
    set({ space, name }, `products.0.name`, true)
    expect(store.state.products[0].name).toBe(true)
  })

  it('set() should set a simple path with variable', async () => {
    const space = nanoid()
    const name = nanoid()
    const store = setStore({ space, name }, {
      state: {
        products: [{ name: 'berries' }],
      },
    })

    await flushPromises()
    set({ space, name }, `{key}`, [], { key: 'products' })
    expect(store.state.products).toEqual([])
  })

  it('set() should set a path in sub-array with variable', async () => {
    const space = nanoid()
    const name = nanoid()
    const store = setStore({ space, name }, {
      state: {
        products: [{ name: 'berries' }],
      },
    })

    await flushPromises()
    set({ space, name }, `products.{key}`, true, { key: 0 })
    expect(store.state.products[0]).toBe(true)
  })

  it('set() should set a path in sub-array object with variable', async () => {
    const space = nanoid()
    const name = nanoid()
    const store = setStore({ space, name }, {
      state: {
        products: [{ name: 'berries' }],
      },
    })

    await flushPromises()
    set({ space, name }, `products.0.{key}`, true, { key: 'name' })
    expect(store.state.products[0].name).toBe(true)
  })

  it('set() should set a path with key/value within an array (without brackets)', async () => {
    const space = nanoid()
    const name = nanoid()
    const store = setStore({ space, name }, {
      state: {
        products: [{ id: 1, name: 'berries' }],
      },
    })

    await flushPromises()
    set({ space, name }, `products.id=1`, true)
    expect(store.state.products[0]).toBe(true)
  })

  it('set() should set a path with key/value within an array (with brackets)', async () => {
    const space = nanoid()
    const name = nanoid()
    const store = setStore({ space, name }, {
      state: {
        products: [{ id: 1, name: 'berries' }],
      },
    })

    await flushPromises()
    set({ space, name }, `products.id=1`, true)
    expect(store.state.products[0]).toBe(true)
  })

  it('set() should set a path with key/value within an array via a variable (with brackets)', async () => {
    const space = nanoid()
    const name = nanoid()
    const store = setStore({ space, name }, {
      state: {
        products: [{ id: 1, name: 'berries' }],
      },
    })

    await flushPromises()
    set({ space, name }, `products[id={id}]`, true, { id: 1 })
    expect(store.state.products[0]).toBe(true)
  })

  it('set() should set a path with key/value within an array via 2 variables (with brackets)', async () => {
    const space = nanoid()
    const name = nanoid()
    const store = setStore({ space, name }, {
      state: {
        products: [{ id: 1, name: 'berries' }],
      },
    })

    await flushPromises()
    set({ space, name }, `products[{key}={id}]`, true, { key: 'id', id: 1 })
    expect(store.state.products[0]).toBe(true)
  })

  /**
   * TODO:
   */
})