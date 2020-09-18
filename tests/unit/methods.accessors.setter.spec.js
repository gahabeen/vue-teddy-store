import { setStore, setter } from '@/index'
import flushPromises from 'flush-promises'
import { nanoid } from 'nanoid'

describe('methods - accessors - setter', () => {
  it('setter() should provide a setter function to set a simple path', async () => {
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
    setter({ space, name }, `products`)([])
    expect(store.state.products).toEqual([])
  })

  it('setter() should provide a setter function to set a path in sub-array', async () => {
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
    setter({ space, name }, `products.0`)(true)
    expect(store.state.products[0]).toBe(true)
  })

  it('setter() should provide a setter function to set a path in sub-array object', async () => {
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
    setter({ space, name }, `products.0.name`)(true)
    expect(store.state.products[0].name).toBe(true)
  })

  /**
   * TODO:
   */
})
