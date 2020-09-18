import { setStore, sync } from '@/index'
import { mount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import { nanoid } from 'nanoid'

describe('methods - accessors - sync [vue 2]', () => {
  it('sync() should provide a sync function to set a simple path', async () => {
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

    mount(
      {
        template: '<div></div>',
        computed: {
          products: sync({ space, name }, `products`),
        },
        mounted() {
          this.products = []
        },
      },
      {}
    )

    await flushPromises()
    expect(store.state.products).toEqual([])
  })

  it('sync() should provide a sync function to set a path in sub-array', async () => {
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

    mount(
      {
        template: '<div></div>',
        computed: {
          firstProduct: sync({ space, name }, `products.0`),
        },
        mounted() {
          this.firstProduct = true
        },
      },
      {}
    )

    await flushPromises()
    expect(store.state.products[0]).toBe(true)
  })

  it('sync() should provide a sync function to set a path in sub-array object', async () => {
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

    mount(
      {
        template: '<div></div>',
        computed: {
          name: sync({ space, name }, `products.0.name`),
        },
        mounted() {
          this.name = true
        },
      },
      {}
    )

    await flushPromises()
    expect(store.state.products[0].name).toBe(true)
  })

  /**
   * TODO:
   */
})
