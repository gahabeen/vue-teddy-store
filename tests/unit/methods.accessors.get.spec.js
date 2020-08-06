import { get, setStore } from '@/index'
import VueCompositionApi from '@vue/composition-api'
import flushPromises from 'flush-promises'
import { nanoid } from 'nanoid'
import Vue from 'vue'

Vue.use(VueCompositionApi)

describe('methods - accessors - get', () => {
  it('get() should access a simple path', async () => {
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
    expect(get({ space, name }, `products`)).toBe(store.state.products)
  })

  it('get() should access a path in sub-array', async () => {
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
    expect(get({ space, name }, `products.0`)).toBe(store.state.products[0])
  })

  it('get() should access a path in sub-array object', async () => {
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
    expect(get({ space, name }, `products.0.name`)).toBe(store.state.products[0].name)
  })

  it('get() should access a simple path with variable', async () => {
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
    expect(get({ space, name }, `{key}`, { key: 'products' })).toBe(store.state.products)
  })

  it('get() should access a path in sub-array with variable', async () => {
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
    expect(get({ space, name }, `products.{key}`, { key: 0 })).toBe(store.state.products[0])
  })

  it('get() should access a path in sub-array object with variable', async () => {
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
    expect(get({ space, name }, `products.0.{key}`, { key: 'name' })).toBe(store.state.products[0].name)
  })

  it('get() should access a path with key/value within an array (without brackets)', async () => {
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
    expect(get({ space, name }, `products.id=1`)).toBe(store.state.products[0])
  })

  it('get() should access a path with key/value within an array (with brackets)', async () => {
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
    expect(get({ space, name }, `products[id=1]`)).toEqual(store.state.products[0])
  })

  it('get() should access a path with key/value within an array via a variable (with brackets)', async () => {
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
    expect(get({ space, name }, `products[id={id}]`, { id: 1 })).toBe(store.state.products[0])
  })

  it('get() should access a path with key/value within an array via 2 variables (with brackets)', async () => {
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
    expect(get({ space, name }, `products[{key}={id}]`, { key: 'id', id: 1 })).toBe(store.state.products[0])
  })

  /* Spread operator */

  it('get() should get a spread path in sub-array', async () => {
    const space = nanoid()
    const name = nanoid()
    const state = {
      products: [{ name: 'berries' }],
    }
    setStore({ space, name }, { state })

    await flushPromises()
    const value = get({ space, name }, `products..`)

    await flushPromises()
    expect(value).toEqual([{ name: 'berries' }])
  })

  it('get() should get a spread (with star) path in sub-array', async () => {
    const space = nanoid()
    const name = nanoid()
    const state = {
      products: [{ name: 'berries' }],
    }
    setStore({ space, name }, { state })

    await flushPromises()
    const value = get({ space, name }, `products.*`)

    await flushPromises()
    expect(value).toEqual([{ name: 'berries' }])
  })

  it('get() should get a spread path in sub-array path', async () => {
    const space = nanoid()
    const name = nanoid()
    const state = {
      products: [{ name: 'berries' }],
    }
    setStore({ space, name }, { state })

    await flushPromises()
    const value = get({ space, name }, `products..name`)

    await flushPromises()
    expect(value).toEqual(['berries'])
  })

  it('get() should get a spread (with star) path in sub-array path', async () => {
    const space = nanoid()
    const name = nanoid()
    const state = {
      products: [{ name: 'berries' }],
    }
    setStore({ space, name }, { state })

    await flushPromises()
    const value = get({ space, name }, `products.*.name`)

    await flushPromises()
    expect(value).toEqual(['berries'])
  })

  it('get() should get a spread path in sub-object', async () => {
    const space = nanoid()
    const name = nanoid()
    const state = {
      products: { 1: { name: 'berries' } },
    }
    setStore({ space, name }, { state })

    await flushPromises()
    const value = get({ space, name }, `products..`)

    await flushPromises()
    expect(value).toEqual([{ name: 'berries' }])
  })

  it('get() should get a spread (with star) path in sub-object', async () => {
    const space = nanoid()
    const name = nanoid()
    const state = {
      products: { 1: { name: 'berries' } },
    }
    setStore({ space, name }, { state })

    await flushPromises()
    const value = get({ space, name }, `products.*`)

    await flushPromises()
    expect(value).toEqual([{ name: 'berries' }])
  })

  it('get() should get a spread path in sub-object path', async () => {
    const space = nanoid()
    const name = nanoid()
    const state = {
      products: { 1: { name: 'berries' } },
    }
    setStore({ space, name }, { state })

    await flushPromises()
    const value = get({ space, name }, `products..name`)

    await flushPromises()
    expect(value).toEqual(['berries'])
  })

  it('get() should get a spread (with star) path in sub-object path', async () => {
    const space = nanoid()
    const name = nanoid()
    const state = {
      products: { 1: { name: 'berries' } },
    }
    setStore({ space, name }, { state })

    await flushPromises()
    const value = get({ space, name }, `products.*.name`)

    await flushPromises()
    expect(value).toEqual(['berries'])
  })
})
