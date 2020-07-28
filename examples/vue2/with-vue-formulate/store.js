import Vue from 'vue'
import VueCompositionApi from '@vue/composition-api'
Vue.use(VueCompositionApi)

import VueTeddyStore from '../../../src/index'
const store = new VueTeddyStore({})

store.add('products', {
  state: {
    list: {
      items: [{ name: 'Berries', price: "5.32" }],
    },
    schema: {
      items: [
      {
        type: 'group',
        name: 'items',
        label: 'Products',
        addLabel: '+ Add a product',
        repeatable: true,
        children: [
          {
            type: "text",
            name: 'name',
            label: 'Name',
          },
           {
            type: "text",
            name: 'price',
            label: 'Price',
            validation: "number"
          },
        ],
      },
    ],
    }
  },
  // getters: {
  //   fullName: ({ state }) => state.firstName + ' ' + state.lastName,
  // },
  // actions: {
  //   refresh({ state }) {
  //     state.firstName = 'Teddy'
  //     state.firstName = 'Bear'
  //   },
  // },
})

export default store
