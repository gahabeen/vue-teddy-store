import { nanoid } from 'nanoid'
import VueCompositionApi from '@vue/composition-api'
import { mount, createLocalVue } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vue from 'vue'
import { Teddies, setFeature, features, setStore } from '@/index'
Vue.use(VueCompositionApi)

import { prefix } from '@/features/cache'

describe('feature, cache', () => {
  it(`should save the state in cache`, async () => {
    const localVue = createLocalVue()

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

    mount(
      {
        template: '<div></div>',
      },
      {
        localVue,
      }
    )

    await flushPromises()
    expect(JSON.parse(window.localStorage.getItem(prefix(space, name)))).toEqual(Teddies.spaces[space].stores[name].state)
  })

  it(`should update the state in cache on state update`, async () => {
    const localVue = createLocalVue()

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

    mount(
      {
        template: '<div></div>',
      },
      {
        localVue,
      }
    )

    await flushPromises()

    store.state.products[0].name = 'BERRIES'
    await flushPromises()

    expect(JSON.parse(window.localStorage.getItem(prefix(space, name)))).toEqual(Teddies.spaces[space].stores[name].state)
  })

  it(`shouldnd't reinstall`, async () => {
    const localVue = createLocalVue()

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

    mount(
      {
        template: '<div></div>',
      },
      {
        localVue,
      }
    )

    await flushPromises()
    expect(JSON.parse(window.localStorage.getItem(prefix(space, name)))).toEqual(Teddies.spaces[space].stores[name].state)
  })
})
