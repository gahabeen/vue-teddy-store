import Vue from 'vue'
import VueCompositionApi from '@vue/composition-api'
Vue.use(VueCompositionApi)

import { setStore, install } from '../../../src/index'

setStore('catalog', {
  state: {
    products: {
      123: {
        id: '123',
        slug: 'page-123',
        title: 'Page 123',
        elements: [
          {
            type: 'title',
          },
          {
            type: 'picture',
          },
          {
            type: 'content',
          },
        ],
      },
      234: {
        id: '234',
        slug: 'page-234',
        title: 'Page 234',
        elements: [
          {
            type: 'title',
          },
          {
            type: 'content',
          },
        ],
      },
    },
  },
})

export default install
