import Vue from 'vue'
import VueCompositionApi from '@vue/composition-api'
Vue.use(VueCompositionApi)

import VueTeddyStore from '../../../src/index'
const store = new VueTeddyStore({})

store.add('user', {
  state: {
    firstName: 'Teddy',
    lastName: '',
  },
  getters: {
    fullName: ({ state }) => state.firstName + ' ' + state.lastName,
  },
  actions: {
    refresh({ state }) {
      state.firstName = 'Teddy'
      state.firstName = 'Bear'
    },
  },
})

export default store
