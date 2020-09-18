import { prefix } from '@/features/cache'
import { features, setFeature, setStore, Teddies } from '@/index'
import { mount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import { nanoid } from 'nanoid'

describe('feature, cache', () => {
  it(`should save the state in cache`, async () => {
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

    setFeature(features.cache)

    mount({
      template: '<div></div>',
    })

    await flushPromises()
    expect(JSON.parse(window.localStorage.getItem(prefix(space, name)))).toEqual(Teddies.spaces[space].stores[name].state)
  })

  it(`should update the state in cache on state update`, async () => {
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

    setFeature(features.cache)

    mount({
      template: '<div></div>',
    })

    await flushPromises()

    store.state.products[0].name = 'BERRIES'
    await flushPromises()

    expect(JSON.parse(window.localStorage.getItem(prefix(space, name)))).toEqual(Teddies.spaces[space].stores[name].state)
  })

  it(`shouldnd't reinstall`, async () => {
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

    setFeature(features.cache)
    setFeature(features.cache)
    setFeature(features.cache)

    mount({
      template: '<div></div>',
    })

    await flushPromises()
    expect(JSON.parse(window.localStorage.getItem(prefix(space, name)))).toEqual(Teddies.spaces[space].stores[name].state)
  })
})
