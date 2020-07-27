import TeddyStore from '@/index'
import VueCompositionApi from '@vue/composition-api'
import { createLocalVue } from '@vue/test-utils'
import Vue from 'vue'

Vue.use(VueCompositionApi)

describe('Store, TeddyStore Class [Common]', () => {
  it('should check if a store exists', async () => {
    const localVue = createLocalVue()
    const store = new TeddyStore()
    store.add('users')

    localVue.use(store)
    
    expect(store.exists('users')).toBe(true)
  })
})
