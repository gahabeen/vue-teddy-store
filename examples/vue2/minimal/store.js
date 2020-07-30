import Vue from 'vue'
import VueCompositionApi from '@vue/composition-api'
Vue.use(VueCompositionApi)

import { setStore, install } from '../../../src/index'

setStore('user', {
  state: {
    profile: {
      firstName: 'Teddy',
      lastName: 'Bear',
      documents: [{
        id: 1,
        name: "passport"
      }]
    }
  },
  getters: {
    fullName: ({ state }) => state.profile.firstName + ' ' + state.profile.lastName,
  },
  actions: {
    refresh({ state }) {
      state.profile.firstName = 'Teddy'
      state.profile.firstName = 'Bear'
    },
  },
})

export default install
