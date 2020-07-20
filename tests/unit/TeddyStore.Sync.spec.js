import VueCompositionApi, { reactive } from '@vue/composition-api'
import { mount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vue from 'vue'
import TeddyStore from '../../src/index'
Vue.use(VueCompositionApi)

import { prefix } from '../../src/plugins/cache'

// const localVue = createLocalVue()
// localVue.use(VueCompositionApi)

const store = new TeddyStore()
Vue.use(store)

describe('[Sync] - TeddyStore.js', () => {
  it(`should save the state in cache`, async () => {
    const state = reactive({
      firstName: 'Teddy',
      lastName: 'Bear',
    })

    Vue.use(store.add('user', { state }).activate(['cache', 'sync']))
    const wrapper = mount({ template: `<div></div>` })
    await flushPromises()
    expect(JSON.parse(window.localStorage.getItem(prefix('user')))).toEqual(wrapper.vm.$teddy.stores.user.state)
  })
})
