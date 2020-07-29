import { nanoid } from 'nanoid'
import VueCompositionApi from '@vue/composition-api'
import { mount, createLocalVue } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vue from 'vue'
import TeddyStore from '@/index'
Vue.use(VueCompositionApi)

import { prefix } from '@/features/cache'

describe('Cache Feature', () => {
  it(`should save the state in cache`, async () => {
    const localVue = createLocalVue()
    const store = new TeddyStore()
    const storeName = nanoid()

    localVue.use(
      store
        .add(storeName, {
          state: {
            firstName: 'Teddy',
            lastName: 'Bear',
          },
        })
        .activate('cache')
    )

    const wrapper = mount({ template: `<div></div>` }, { localVue })
    await flushPromises()
    await flushPromises()
    expect(JSON.parse(window.localStorage.getItem(prefix(storeName)))).toEqual(wrapper.vm.$teddy.stores[storeName].state)
  })
})
