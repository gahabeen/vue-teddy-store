import { setStore, has } from '@/index'
import VueCompositionApi from '@vue/composition-api'
import flushPromises from 'flush-promises'
import { nanoid } from 'nanoid'
import Vue from 'vue'

Vue.use(VueCompositionApi)

describe('methods - accessors - has', () => {
  it('has() should check a simple path exists', async () => {
    const space = nanoid()
    const name = nanoid()
    setStore({ space, name }, {
      state: {
        products: [{ name: 'berries' }],
      },
    })

    await flushPromises()
    expect(has({ space, name }, `products`)).toBe(true)
  })

  it('has() should check a path in sub-array exists', async () => {
    const space = nanoid()
    const name = nanoid()
    setStore({ space, name }, {
      state: {
        products: [{ name: 'berries' }],
      },
    })

    await flushPromises()
    expect(has({ space, name }, `products.0`)).toBe(true)
  })

  it('has() should check a path in sub-array object exists', async () => {
    const space = nanoid()
    const name = nanoid()
    setStore({ space, name }, {
      state: {
        products: [{ name: 'berries' }],
      },
    })

    await flushPromises()
    expect(has({ space, name }, `products.0.name`)).toBe(true)
  })

  it('has() should check a simple path with variable', async () => {
    const space = nanoid()
    const name = nanoid()
    setStore({ space, name }, {
      state: {
        products: [{ name: 'berries' }],
      },
    })

    await flushPromises()
    expect(has({ space, name }, `{key}`, { key: 'products' })).toBe(true)
  })

  it('has() should check a path in sub-array with variable', async () => {
    const space = nanoid()
    const name = nanoid()
    setStore({ space, name }, {
      state: {
        products: [{ name: 'berries' }],
      },
    })

    await flushPromises()
    expect(has({ space, name }, `products.{key}`, { key: 0 })).toBe(true)
  })

  it('has() should check a path in sub-array object with variable', async () => {
    const space = nanoid()
    const name = nanoid()
    setStore({ space, name }, {
      state: {
        products: [{ name: 'berries' }],
      },
    })

    await flushPromises()
    expect(has({ space, name }, `products.0.{key}`, { key: 'name' })).toBe(true)
  })

  it('has() should check a path with key/value within an array (without brackets)', async () => {
    const space = nanoid()
    const name = nanoid()
    setStore({ space, name }, {
      state: {
        products: [{ id: 1, name: 'berries' }],
      },
    })

    await flushPromises()
    expect(has({ space, name }, `products.id=1`)).toBe(true)
  })

  it('has() should check a path with key/value within an array (with brackets)', async () => {
    const space = nanoid()
    const name = nanoid()
    setStore({ space, name }, {
      state: {
        products: [{ id: 1, name: 'berries' }],
      },
    })

    await flushPromises()
    expect(has({ space, name }, `products[id=1]`)).toBe(true)
  })

  it('has() should check a path with key/value within an array via a variable (with brackets)', async () => {
    const space = nanoid()
    const name = nanoid()
    setStore({ space, name }, {
      state: {
        products: [{ id: 1, name: 'berries' }],
      },
    })

    await flushPromises()
    expect(has({ space, name }, `products[id={id}]`, { id: 1 })).toBe(true)
  })

  it('has() should check a path with key/value within an array via 2 variables (with brackets)', async () => {
    const space = nanoid()
    const name = nanoid()
    setStore({ space, name }, {
      state: {
        products: [{ id: 1, name: 'berries' }],
      },
    })

    await flushPromises()
    expect(has({ space, name }, `products[{key}={id}]`, { key: 'id', id: 1 })).toBe(true)
  })

  /**
   * TODO:
   */
})
