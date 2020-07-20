import VueCompositionApi, { reactive } from '@vue/composition-api'
import { mount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vue from 'vue'
import TeddyStore from '../../src/index'
Vue.use(VueCompositionApi)

// const localVue = createLocalVue()
// localVue.use(VueCompositionApi)

const store = new TeddyStore()
Vue.use(store)

describe('[History] - TeddyStore.js', () => {
  it(`should save the state in cache`, async () => {
    const state = reactive({
      firstName: 'Teddy',
      lastName: 'Bear',
    })

    Vue.use(store.add('user', { state }).activate(['history']))
    const wrapper = mount({ template: `<div></div>` })
    await flushPromises()
    wrapper.vm.$teddy.stores.user.state.firstName = 'Ted'
    await flushPromises()
    expect(wrapper.vm.$teddy.stores.user._history.length).toEqual(2)
  })
})
