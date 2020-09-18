import { features, setFeature, setStore, Teddies } from '@/index'
import { mount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import { nanoid } from 'nanoid'

describe('feature, history', () => {
  it(`should save the state in history`, async () => {
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

    setFeature(features.history)

    mount({
      template: '<div></div>',
    })

    await flushPromises()
    store.state.products[0].name = 'BERRIES'
    await flushPromises()
    expect(Teddies.spaces[space].stores[name].features.history.stack.length).toEqual(2)
  })

  it(`shouldnd't reinstall`, async () => {
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

    setFeature(features.history)
    setFeature(features.history)
    setFeature(features.history)

    mount(
      {
        template: '<div></div>',
      },
      {}
    )

    await flushPromises()
    store.state.products[0].name = 'BERRIES'
    await flushPromises()
    expect(Teddies.spaces[space].stores[name].features.history.stack.length).toEqual(2)
  })
})
