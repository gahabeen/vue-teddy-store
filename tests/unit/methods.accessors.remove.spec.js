import { remove, setStore } from '@/index'
import VueCompositionApi, { watch } from '@vue/composition-api'
import flushPromises from 'flush-promises'
import { nanoid } from 'nanoid'
import Vue from 'vue'

Vue.use(VueCompositionApi)

Vue.config.productionTip = false
Vue.config.devtools = false

describe('methods - accessors - remove', () => {
  it('remove() should remove a simple path', async () => {
    const space = nanoid()
    const name = nanoid()
    const state = {
      products: [{ name: 'berries' }],
    }
    const store = setStore({ space, name }, { state })

    await flushPromises()
    remove({ space, name }, `products`)

    await flushPromises()
    expect(store.state).toEqual({})
  })

  it('remove() should remove a path in sub-array', async () => {
    const space = nanoid()
    const name = nanoid()
    const state = {
      products: [{ name: 'berries' }],
    }
    const store = setStore({ space, name }, { state })

    await flushPromises()
    remove({ space, name }, `products.0`)

    await flushPromises()
    expect(store.state.products).toEqual([])
  })

  it('remove() should remove a path in sub-array object', async () => {
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
    remove({ space, name }, `products.0.name`)

    await flushPromises()
    expect(store.state.products[0]).toEqual({})
  })

  it('remove() should remove a simple path with variable', async () => {
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
    remove({ space, name }, `{key}`, { key: 'products' })

    await flushPromises()
    expect(store.state).toEqual({})
  })

  it('remove() should remove a path in sub-array with variable', async () => {
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
    remove({ space, name }, `products.{key}`, { key: 0 })
    expect(store.state.products).toEqual([])
  })

  it('remove() should remove a path in sub-array object with variable', async () => {
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
    remove({ space, name }, `products.0.{key}`, { key: 'name' })
    expect(store.state.products[0]).toEqual({})
  })

  it('remove() should remove a path with key/value within an array (without brackets)', async () => {
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
    remove({ space, name }, `products.id=1`)
    expect(store.state.products).toEqual([])
  })

  it('remove() should remove a path with key/value within an array (with brackets)', async () => {
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
    remove({ space, name }, `products[id=1]`)
    expect(store.state.products).toEqual([])
  })

  it('remove() should remove a path with key/value within an array via a variable (with brackets)', async () => {
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
    remove({ space, name }, `products[id={id}]`, { id: 1 })
    expect(store.state.products).toEqual([])
  })

  it('remove() should remove a path with key/value within an array via 2 variables (with brackets)', async () => {
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
    remove({ space, name }, `products[{key}={id}]`, { key: 'id', id: 1 })
    expect(store.state.products).toEqual([])
  })

  /* Spread operator */

  it('remove() should remove a spread path in sub-array', async () => {
    const space = nanoid()
    const name = nanoid()
    const state = {
      products: [{ name: 'berries' }],
    }
    const store = setStore({ space, name }, { state })

    await flushPromises()
    remove({ space, name }, `products..`)

    await flushPromises()
    expect(store.state.products).toEqual([])
  })

  it('remove() should remove a spread (with star) path in sub-array', async () => {
    const space = nanoid()
    const name = nanoid()
    const state = {
      products: [{ name: 'berries' }],
    }
    const store = setStore({ space, name }, { state })

    await flushPromises()
    remove({ space, name }, `products.*`)

    await flushPromises()
    expect(store.state.products).toEqual([])
  })

  it('remove() should remove a spread path in sub-array path', async () => {
    const space = nanoid()
    const name = nanoid()
    const state = {
      products: [{ name: 'berries' }],
    }
    const store = setStore({ space, name }, { state })

    await flushPromises()
    remove({ space, name }, `products..name`)

    await flushPromises()
    expect(store.state.products).toEqual([{}])
  })

  it('remove() should remove a spread (with star) path in sub-array path', async () => {
    const space = nanoid()
    const name = nanoid()
    const state = {
      products: [{ name: 'berries' }],
    }
    const store = setStore({ space, name }, { state })

    await flushPromises()
    remove({ space, name }, `products.*.name`)

    await flushPromises()
    expect(store.state.products).toEqual([{}])
  })

  it('remove() should remove a spread path in sub-object', async () => {
    const space = nanoid()
    const name = nanoid()
    const state = {
      products: { 1: { name: 'berries' } },
    }
    const store = setStore({ space, name }, { state })

    await flushPromises()
    remove({ space, name }, `products..`)

    await flushPromises()
    expect(store.state.products).toEqual({})
  })

  it('remove() should remove a spread (with star) path in sub-object', async () => {
    const space = nanoid()
    const name = nanoid()
    const state = {
      products: { 1: { name: 'berries' } },
    }
    const store = setStore({ space, name }, { state })

    await flushPromises()
    remove({ space, name }, `products.*`)

    await flushPromises()
    expect(store.state.products).toEqual({})
  })

  it('remove() should remove a spread path in sub-object path', async () => {
    const space = nanoid()
    const name = nanoid()
    const state = {
      products: { 1: { name: 'berries' } },
    }
    const store = setStore({ space, name }, { state })

    await flushPromises()
    remove({ space, name }, `products..name`)

    await flushPromises()
    expect(store.state.products).toEqual({ 1: {} })
  })

  it('remove() should remove a spread (with star) path in sub-object path', async () => {
    const space = nanoid()
    const name = nanoid()
    const state = {
      products: { 1: { name: 'berries' } },
    }
    const store = setStore({ space, name }, { state })

    await flushPromises()
    remove({ space, name }, `products.*.name`)

    await flushPromises()
    expect(store.state.products).toEqual({ 1: {} })
  })

  it('remove() in array should fire a watchable update', async () => {
    const space = nanoid()
    const name = nanoid()
    const store = setStore(
      { space, name },
      {
        state: {
          products: [{ name: 'honey' }],
        },
      }
    )

    let hit = 0

    watch(store.state, () => {
      hit = hit + 1
    })

    await flushPromises()
    remove({ space, name }, `products.0`)
    await flushPromises()
    expect(hit).toEqual(1)
    expect(store.state.products).toEqual([])
  })

  it('remove() in object should fire a watchable update', async () => {
    const space = nanoid()
    const name = nanoid()
    const store = setStore(
      { space, name },
      {
        state: {
          products: { 1: { name: 'honey' } },
        },
      }
    )

    let hit = 0

    watch(store.state, () => {
      hit = hit + 1
    })

    await flushPromises()
    remove({ space, name }, `products.1`)
    await flushPromises()
    expect(hit).toEqual(1)
    expect(store.state.products).toEqual({})
  })
})
