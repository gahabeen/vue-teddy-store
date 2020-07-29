import { useTeddy } from '@/index'
import VueCompositionApi from '@vue/composition-api'

import Vue from 'vue'
Vue.use(VueCompositionApi)

describe.only('methods', () => {
  it('useTeddy() should provide a teddy by-default namespaced access', async () => {
    const teddy = useTeddy()
    teddy.setStore('users', {
      state: {
        firstName: 'Teddy',
      },
    })

    expect(teddy.exists('users')).toBe(true)
  })
})
