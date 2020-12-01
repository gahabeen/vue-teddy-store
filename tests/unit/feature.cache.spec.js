import { nanoid } from 'nanoid'
import VueCompositionApi from '@vue/composition-api'
import { mount, createLocalVue } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vue from 'vue'
import { Teddies, setFeature, features, setStore } from '@/index'
Vue.use(VueCompositionApi)

Vue.config.productionTip = false
Vue.config.devtools = false

import { prefix } from '@/features/cache'

// const window = {
//   localStorage: {
//     items: {},
//     getItem: function(key) {
//       console.log('getItem', key, this.items[key])
//       return this.items[key] || {}
//     },
//     setItem: function(key, value) {
//       console.log('setItem', key, value)
//       this.items[key] = value
//     },
//   },
// }

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

    await new Promise((resolve) => setTimeout(resolve, 300))

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

    await new Promise((resolve) => setTimeout(resolve, 300))

    mount(
      {
        template: '<div></div>',
      },
      {
        localVue,
      }
    )

    await flushPromises()

    store.state.products[0].name = 'berries'
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

    await new Promise((resolve) => setTimeout(resolve, 1000))

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
