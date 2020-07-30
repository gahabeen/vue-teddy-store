import { nanoid } from 'nanoid'
import VueCompositionApi from '@vue/composition-api'
import { mount, createLocalVue } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vue from 'vue'
import { Teddies, setFeature, features, setStore } from '@/index'
Vue.use(VueCompositionApi)

describe('feature, history', () => {
  it(`should save the state in history`, async () => {
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

    setFeature(features.history)

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
    expect(Teddies.value.spaces[space].stores[name].features.history.stack.length).toEqual(2)
  })

  it(`shouldnd't reinstall`, async () => {
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

    setFeature(features.history)
    setFeature(features.history)
    setFeature(features.history)

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
    expect(Teddies.value.spaces[space].stores[name].features.history.stack.length).toEqual(2)
  })
})
