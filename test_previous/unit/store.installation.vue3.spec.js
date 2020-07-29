import TeddyStore from '@/index'
import VueCompositionApi from '@vue/composition-api'
import { createLocalVue, mount } from '@vue/test-utils'
import Vue from 'vue'

Vue.use(VueCompositionApi)

describe('Store, Installation [Vue 3]', () => {
  it('should be available under global variable $teddy within root', async () => {
    const localVue = createLocalVue()
    const store = new TeddyStore()
    localVue.use(store)

    mount(
      {
        template: `<div></div>`,
        setup(_, { root }) {
          expect(root.$teddy).toBeInstanceOf(TeddyStore)
          return {}
        },
      },
      {
        localVue,
      }
    )
  })
})
