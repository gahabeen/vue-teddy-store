import { setStore, has } from '@/index'
import VueCompositionApi from '@vue/composition-api'
import flushPromises from 'flush-promises'
import { nanoid } from 'nanoid'
import Vue from 'vue'

Vue.use(VueCompositionApi)

Vue.config.productionTip = false
Vue.config.devtools = false

describe('methods - accessors - has', () => {
  it('has() should check a simple path exists', async () => {
    const space = nanoid()
    const name = nanoid()
    setStore(
      { space, name },
      {
        state: {
          products: [{ name: 'berries' }],
        },
      }
    )

    await flushPromises()
    expect(has({ space, name }, `products`)).toBe(true)
  })

  it('has() should check a path in sub-array exists', async () => {
    const space = nanoid()
    const name = nanoid()
    setStore(
      { space, name },
      {
        state: {
          products: [{ name: 'berries' }],
        },
      }
    )

    await flushPromises()
    expect(has({ space, name }, `products.0`)).toBe(true)
  })

  it('has() should check a path in sub-array object exists', async () => {
    const space = nanoid()
    const name = nanoid()
    setStore(
      { space, name },
      {
        state: {
          products: [{ name: 'berries' }],
        },
      }
    )

    await flushPromises()
    expect(has({ space, name }, `products.0.name`)).toBe(true)
  })

  it('has() should check a simple path with variable', async () => {
    const space = nanoid()
    const name = nanoid()
    setStore(
      { space, name },
      {
        state: {
          products: [{ name: 'berries' }],
        },
      }
    )

    await flushPromises()
    expect(has({ space, name }, `{key}`, { key: 'products' })).toBe(true)
  })

  it('has() should check a path in sub-array with variable', async () => {
    const space = nanoid()
    const name = nanoid()
    setStore(
      { space, name },
      {
        state: {
          products: [{ name: 'berries' }],
        },
      }
    )

    await flushPromises()
    expect(has({ space, name }, `products.{key}`, { key: 0 })).toBe(true)
  })

  it('has() should check a path in sub-array object with variable', async () => {
    const space = nanoid()
    const name = nanoid()
    setStore(
      { space, name },
      {
        state: {
          products: [{ name: 'berries' }],
        },
      }
    )

    await flushPromises()
    expect(has({ space, name }, `products.0.{key}`, { key: 'name' })).toBe(true)
  })

  it('has() should check a path with key/value within an array (without brackets)', async () => {
    const space = nanoid()
    const name = nanoid()
    setStore(
      { space, name },
      {
        state: {
          products: [{ id: 1, name: 'berries' }],
        },
      }
    )

    await flushPromises()
    expect(has({ space, name }, `products.id=1`)).toBe(true)
  })

  it('has() should check a path with key/value within an array (with brackets)', async () => {
    const space = nanoid()
    const name = nanoid()
    setStore(
      { space, name },
      {
        state: {
          products: [{ id: 1, name: 'berries' }],
        },
      }
    )

    await flushPromises()
    expect(has({ space, name }, `products[id=1]`)).toBe(true)
  })

  it('has() should check a path with key/value within an array via a variable (with brackets)', async () => {
    const space = nanoid()
    const name = nanoid()
    setStore(
      { space, name },
      {
        state: {
          products: [{ id: 1, name: 'berries' }],
        },
      }
    )

    await flushPromises()
    expect(has({ space, name }, `products[id={id}]`, { id: 1 })).toBe(true)
  })

  it('has() should check a path with key/value within an array via 2 variables (with brackets)', async () => {
    const space = nanoid()
    const name = nanoid()
    setStore(
      { space, name },
      {
        state: {
          products: [{ id: 1, name: 'berries' }],
        },
      }
    )

    await flushPromises()
    expect(has({ space, name }, `products[{key}={id}]`, { key: 'id', id: 1 })).toBe(true)
  })

  /* Spread operator */

  it('has() should check if has a spread path in sub-array', async () => {
    const space = nanoid()
    const name = nanoid()
    const state = {
      products: [{ name: 'berries' }],
    }
    setStore({ space, name }, { state })

    await flushPromises()
    const valid = has({ space, name }, `products..`)

    await flushPromises()
    expect(valid).toBe(true)
  })

  it('has() should check if has a spread (with star) path in sub-array', async () => {
    const space = nanoid()
    const name = nanoid()
    const state = {
      products: [{ name: 'berries' }],
    }
    setStore({ space, name }, { state })

    await flushPromises()
    const valid = has({ space, name }, `products.*`)

    await flushPromises()
    expect(valid).toBe(true)
  })

  it('has() should check if has a spread path in sub-array path', async () => {
    const space = nanoid()
    const name = nanoid()
    const state = {
      products: [{ name: 'berries' }],
    }
    setStore({ space, name }, { state })

    await flushPromises()
    const valid = has({ space, name }, `products..name`)

    await flushPromises()
    expect(valid).toBe(true)
  })

  it('has() should check if has a spread (with star) path in sub-array path', async () => {
    const space = nanoid()
    const name = nanoid()
    const state = {
      products: [{ name: 'berries' }],
    }
    setStore({ space, name }, { state })

    await flushPromises()
    const valid = has({ space, name }, `products.*.name`)

    await flushPromises()
    expect(valid).toBe(true)
  })

  it('has() should check if has a spread path in sub-object', async () => {
    const space = nanoid()
    const name = nanoid()
    const state = {
      products: { 1: { name: 'berries' } },
    }
    setStore({ space, name }, { state })

    await flushPromises()
    const valid = has({ space, name }, `products..`)

    await flushPromises()
    expect(valid).toBe(true)
  })

  it('has() should check if has a spread (with star) path in sub-object', async () => {
    const space = nanoid()
    const name = nanoid()
    const state = {
      products: { 1: { name: 'berries' } },
    }
    setStore({ space, name }, { state })

    await flushPromises()
    const valid = has({ space, name }, `products.*`)

    await flushPromises()
    expect(valid).toBe(true)
  })

  it('has() should check if has a spread path in sub-object path', async () => {
    const space = nanoid()
    const name = nanoid()
    const state = {
      products: { 1: { name: 'berries' } },
    }
    setStore({ space, name }, { state })

    await flushPromises()
    const valid = has({ space, name }, `products..name`)

    await flushPromises()
    expect(valid).toBe(true)
  })

  it('has() should check if has a spread path in sub-object path via a variable', async () => {
    const space = nanoid()
    const name = nanoid()
    const state = {
      products: { 1: { name: 'berries' } },
    }
    setStore({ space, name }, { state })

    await flushPromises()
    const valid = has({ space, name }, `products..name={name}`, { name: 'berries' })

    await flushPromises()
    expect(valid).toBe(true)
  })

  it('has() should check if has a spread (with star) path in sub-object path', async () => {
    const space = nanoid()
    const name = nanoid()
    const state = {
      products: { 1: { name: 'berries' } },
    }
    setStore({ space, name }, { state })

    await flushPromises()
    const valid = has({ space, name }, `products.*.name`)

    await flushPromises()
    expect(valid).toBe(true)
  })
})
