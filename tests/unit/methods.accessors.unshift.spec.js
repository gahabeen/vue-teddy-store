import { unshift, setStore } from '@/index'
import VueCompositionApi from '@vue/composition-api'
import flushPromises from 'flush-promises'
import { nanoid } from 'nanoid'
import Vue from 'vue'

Vue.use(VueCompositionApi)

describe('methods - accessors - unshift', () => {
  it('unshift() should unshift a simple path', async () => {
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
    unshift({ space, name }, `products`, { name: 'honey' })
    expect(store.state.products).toEqual([{ name: 'honey' }, { name: 'berries' }])
  })

  it('unshift() should unshift a path in sub-array', async () => {
    const space = nanoid()
    const name = nanoid()
    const store = setStore(
      { space, name },
      {
        state: {
          products: [{ name: 'berries', list: [] }],
        },
      }
    )

    await flushPromises()
    unshift({ space, name }, `products.0.list`, true)
    expect(store.state.products[0].list).toEqual([true])
  })

  it('unshift() should unshift a simple path with variable', async () => {
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
    unshift({ space, name }, `{key}`, { name: 'honey' }, { key: 'products' })
    expect(store.state.products).toEqual([{ name: 'honey' }, { name: 'berries' }])
  })

  // it('unshift() should unshift a path in sub-array with variable', async () => {
  //   const space = nanoid()
  //   const name = nanoid()
  //   const store = setStore(
  //     { space, name },
  //     {
  //       state: {
  //         products: [{ name: 'berries' }],
  //       },
  //     }
  //   )

  //   await flushPromises()
  //   unshift({ space, name }, `products.{key}`, true, { key: 0 })
  //   expect(store.state.products[0]).toBe(true)
  // })

  // it('unshift() should unshift a path in sub-array object with variable', async () => {
  //   const space = nanoid()
  //   const name = nanoid()
  //   const store = setStore(
  //     { space, name },
  //     {
  //       state: {
  //         products: [{ name: 'berries' }],
  //       },
  //     }
  //   )

  //   await flushPromises()
  //   unshift({ space, name }, `products.0.{key}`, true, { key: 'name' })
  //   expect(store.state.products[0].name).toBe(true)
  // })

  // it('unshift() should unshift a path with key/value within an array (without brackets)', async () => {
  //   const space = nanoid()
  //   const name = nanoid()
  //   const store = setStore(
  //     { space, name },
  //     {
  //       state: {
  //         products: [{ id: 1, name: 'berries' }],
  //       },
  //     }
  //   )

  //   await flushPromises()
  //   unshift({ space, name }, `products.id=1`, true)
  //   expect(store.state.products[0]).toBe(true)
  // })

  // it('unshift() should unshift a path with key/value within an array (with brackets)', async () => {
  //   const space = nanoid()
  //   const name = nanoid()
  //   const store = setStore(
  //     { space, name },
  //     {
  //       state: {
  //         products: [{ id: 1, name: 'berries' }],
  //       },
  //     }
  //   )

  //   await flushPromises()
  //   unshift({ space, name }, `products.id=1`, true)
  //   expect(store.state.products[0]).toBe(true)
  // })

  // it('unshift() should unshift a path with key/value within an array via a variable (with brackets)', async () => {
  //   const space = nanoid()
  //   const name = nanoid()
  //   const store = setStore(
  //     { space, name },
  //     {
  //       state: {
  //         products: [{ id: 1, name: 'berries' }],
  //       },
  //     }
  //   )

  //   await flushPromises()
  //   unshift({ space, name }, `products[id={id}]`, true, { id: 1 })
  //   expect(store.state.products[0]).toBe(true)
  // })

  // it('unshift() should unshift a path with key/value within an array via 2 variables (with brackets)', async () => {
  //   const space = nanoid()
  //   const name = nanoid()
  //   const store = setStore(
  //     { space, name },
  //     {
  //       state: {
  //         products: [{ id: 1, name: 'berries' }],
  //       },
  //     }
  //   )

  //   await flushPromises()
  //   unshift({ space, name }, `products[{key}={id}]`, true, { key: 'id', id: 1 })
  //   expect(store.state.products[0]).toBe(true)
  // })

  // /* Spread operator */

  // it('unshift() should unshift a spread path in sub-array', async () => {
  //   const space = nanoid()
  //   const name = nanoid()
  //   const state = {
  //     products: [{ name: 'berries' }],
  //   }
  //   const store = setStore({ space, name }, { state })

  //   await flushPromises()
  //   unshift({ space, name }, `products..`, null)

  //   await flushPromises()
  //   expect(store.state.products).toEqual([null])
  // })

  // it('unshift() should unshift a spread (with star) path in sub-array', async () => {
  //   const space = nanoid()
  //   const name = nanoid()
  //   const state = {
  //     products: [{ name: 'berries' }],
  //   }
  //   const store = setStore({ space, name }, { state })

  //   await flushPromises()
  //   unshift({ space, name }, `products.*`, null)

  //   await flushPromises()
  //   expect(store.state.products).toEqual([null])
  // })

  // it('unshift() should unshift a spread path in sub-array path', async () => {
  //   const space = nanoid()
  //   const name = nanoid()
  //   const state = {
  //     products: [{ name: 'berries' }],
  //   }
  //   const store = setStore({ space, name }, { state })

  //   await flushPromises()
  //   unshift({ space, name }, `products..name`, null)

  //   await flushPromises()
  //   expect(store.state.products).toEqual([{ name: null }])
  // })

  // it('unshift() should unshift a spread (with star) path in sub-array path', async () => {
  //   const space = nanoid()
  //   const name = nanoid()
  //   const state = {
  //     products: [{ name: 'berries' }],
  //   }
  //   const store = setStore({ space, name }, { state })

  //   await flushPromises()
  //   unshift({ space, name }, `products.*.name`, null)

  //   await flushPromises()
  //   expect(store.state.products).toEqual([{ name: null }])
  // })

  // it('unshift() should unshift a spread path in sub-object', async () => {
  //   const space = nanoid()
  //   const name = nanoid()
  //   const state = {
  //     products: { 1: { name: 'berries' } },
  //   }
  //   const store = setStore({ space, name }, { state })

  //   await flushPromises()
  //   unshift({ space, name }, `products..`, null)

  //   await flushPromises()
  //   expect(store.state.products).toEqual({ 1: null })
  // })

  // it('unshift() should unshift a spread (with star) path in sub-object', async () => {
  //   const space = nanoid()
  //   const name = nanoid()
  //   const state = {
  //     products: { 1: { name: 'berries' } },
  //   }
  //   const store = setStore({ space, name }, { state })

  //   await flushPromises()
  //   unshift({ space, name }, `products.*`, null)

  //   await flushPromises()
  //   expect(store.state.products).toEqual({ 1: null })
  // })

  // it('unshift() should unshift a spread path in sub-object path', async () => {
  //   const space = nanoid()
  //   const name = nanoid()
  //   const state = {
  //     products: { 1: { name: 'berries' } },
  //   }
  //   const store = setStore({ space, name }, { state })

  //   await flushPromises()
  //   unshift({ space, name }, `products..name`, null)

  //   await flushPromises()
  //   expect(store.state.products).toEqual({ 1: { name: null } })
  // })

  // it('unshift() should unshift a spread (with star) path in sub-object path', async () => {
  //   const space = nanoid()
  //   const name = nanoid()
  //   const state = {
  //     products: { 1: { name: 'berries' } },
  //   }
  //   const store = setStore({ space, name }, { state })

  //   await flushPromises()
  //   unshift({ space, name }, `products.*.name`, null)

  //   await flushPromises()
  //   expect(store.state.products).toEqual({ 1: { name: null } })
  // })
})
