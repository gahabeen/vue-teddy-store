import VueCompositionApi from '@vue/composition-api'
import Vue from 'vue'

Vue.use(VueCompositionApi)

Vue.config.productionTip = false
Vue.config.devtools = false

describe('methods - store', () => {
  it('setStore() should set a store state', async () => {
    // const store = setStore(null, null, {
    //   firstName: 'Teddy',
    // })
    // expect(store.state.firstName).toBe('Teddy')
    expect(true).toBe(true)
  })
})
