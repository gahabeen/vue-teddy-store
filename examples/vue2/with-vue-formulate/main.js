import Vue from 'vue'
// import * as path from "path"
import VueFormulate from '@braid/vue-formulate'
import '@braid/vue-formulate/themes/snow/snow.scss'
import store from './store'

import App from '../../App.vue'
import TestPage from './TestPage.vue'

const name = "Teddy with Vue Formulate"

Vue.config.productionTip = false
Vue.config.devtools = true

Vue.use(VueFormulate)
Vue.use(store)

new Vue({
  render: (h) => h(App, { props: { component: TestPage, name  } }),
}).$mount('#app')
