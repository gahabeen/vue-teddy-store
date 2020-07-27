import TeddyStore from '@/index'
import { prefix } from '@/plugins/cache'
import VueCompositionApi, { ref } from '@vue/composition-api'
import { mount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import { nanoid } from 'nanoid'
import Vue from 'vue'
Vue.use(VueCompositionApi)

const store = new TeddyStore()
Vue.use(store)

describe('Store, Sync Plugin', () => {
  it(`should sync the state in cache`, async () => {
    const state = ref({
      firstName: 'Teddy',
      lastName: 'Bear',
    })
    const storeName = nanoid()

    Vue.use(store.add(storeName, { state }).activate(['cache', 'sync']))
    const wrapper = mount({ template: `<div></div>` })
    await flushPromises()
    expect(JSON.parse(window.localStorage.getItem(prefix(storeName)))).toEqual(wrapper.vm.$teddy.stores[storeName].state.value)
  })
})
