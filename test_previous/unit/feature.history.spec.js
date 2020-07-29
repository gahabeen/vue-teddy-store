import TeddyStore from '@/index'
import VueCompositionApi, { ref } from '@vue/composition-api'
import { mount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import { nanoid } from 'nanoid'
import Vue from 'vue'
Vue.use(VueCompositionApi)

const store = new TeddyStore()
Vue.use(store)

describe('History Feature', () => {
  it(`should save the state in cache`, async () => {
    const state = ref({
      firstName: 'Teddy',
      lastName: 'Bear',
    })
    const storeName = nanoid()

    Vue.use(store.add(storeName, { state }).activate(['history']))
    const wrapper = mount({ template: `<div></div>` })
    await flushPromises()
    wrapper.vm.$teddy.stores[storeName].state.firstName = 'Ted'
    await flushPromises()
    expect(wrapper.vm.$teddy.stores[storeName]._history.length).toEqual(2)
  })
})
