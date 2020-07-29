import Vue from 'vue'
import VueCompositionApi, { ref } from '@vue/composition-api'
Vue.use(VueCompositionApi)

export const Teddy = Symbol()
export const TeddyStore = Symbol()

export const Teddies = ref({
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
})