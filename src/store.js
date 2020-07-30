import VueCompositionApi from '@vue/composition-api'
import Vue from 'vue'
Vue.use(VueCompositionApi)

export const Teddy = Symbol()
export const TeddyStore = Symbol()

export const Teddies = {
  __options: { devtools: true },
  spaces: {
    // $: {
    //   options: { devtools: true },
    //   stores: {
    //     // '@': {
    //     //   _state: {},
    //     //   state: {},
    //     //   getters: {},
    //     //   actions: {},
    //     //   watchers: [], // { path, handler }
    //     //   options: { devtools: true },
    //     // },
    //   },
    // },
  },
}