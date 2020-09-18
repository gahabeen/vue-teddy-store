import { getter, setStore, useStore } from '@/index'
import { computed } from 'vue'
import flushPromises from 'flush-promises'
import { nanoid } from 'nanoid'

describe('methods - accessors - MIX', () => {
  it('getter() on unexistent simple prop should fire', async () => {
    const space = nanoid()
    const name = nanoid()
    const store = setStore(
      { space, name },
      {
        state: {},
      }
    )

    const { set } = useStore({ space, name })

    await flushPromises()
    const products = computed(getter({ space, name }, `products`))
    expect(products.value).toBe(undefined)
    await flushPromises()
    set('products', [])
    // store.state = { products: [] }
    expect(store.state.products).toEqual([])
    expect(products.value).toEqual([])
  })
})
