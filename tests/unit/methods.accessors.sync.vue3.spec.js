import { sync, setStore, computed } from '@/index'
import VueCompositionApi from '@vue/composition-api'
import { createLocalVue, mount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import { nanoid } from 'nanoid'
import Vue from 'vue'

Vue.use(VueCompositionApi)

Vue.config.productionTip = false
Vue.config.devtools = false

describe('methods - accessors - sync [vue 3]', () => {
  it('sync() should provide a sync function to set a simple path', async () => {
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

    const wrapper = mount(
      {
        template: '<div></div>',
        setup() {
          const products = computed(sync({ space, name }, `products`))
          return { products }
        },
      },
      {
        localVue,
      }
    )

    await flushPromises()
    wrapper.vm.products = []
    expect(store.state.products).toEqual([])
  })

  it('sync() should provide a sync function to set a path in sub-array', async () => {
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

    const wrapper = mount(
      {
        template: '<div></div>',
        setup() {
          const firstProduct = computed(sync({ space, name }, `products.0`))
          return { firstProduct }
        },
      },
      {
        localVue,
      }
    )

    await flushPromises()
    wrapper.vm.firstProduct = true
    expect(store.state.products[0]).toBe(true)
  })

  it('sync() should provide a sync function to set a path in sub-array object', async () => {
    const localVue = createLocalVue()

    const space = nanoid()
    const storeName = nanoid()
    const store = setStore(
      { space, name: storeName },
      {
        state: {
          products: [{ name: 'berries' }],
        },
      }
    )

    const wrapper = mount(
      {
        template: '<div></div>',
        setup() {
          const name = computed(sync({ space, name: storeName }, `products.0.name`))
          return { name }
        },
      },
      {
        localVue,
      }
    )

    await flushPromises()
    wrapper.vm.name = true
    expect(store.state.products[0].name).toBe(true)
  })

  /**
   * TODO:
   */
})
