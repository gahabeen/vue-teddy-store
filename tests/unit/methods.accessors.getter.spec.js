import { getter, setStore } from '@/index'
import flushPromises from 'flush-promises'
import { nanoid } from 'nanoid'

describe('methods - accessors - getter', () => {
  it('getter() should provide a getter function for a simple path', async () => {
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
    expect(getter({ space, name }, `products`)()).toBe(store.state.products)
  })

  it('getter() should provide a getter function for a path in sub-array', async () => {
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
    expect(getter({ space, name }, `products.0`)()).toBe(store.state.products[0])
  })

  it('getter() should provide a getter function for a path in sub-array object', async () => {
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
    expect(getter({ space, name }, `products.0.name`)()).toBe(store.state.products[0].name)
  })
})
