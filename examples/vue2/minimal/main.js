import Vue from 'vue'

import store from './store'

import App from '../../App.vue'
import TestPage from './TestPage.vue'

const name = "Minimal implementation of Teddy"

Vue.config.productionTip = false
Vue.config.devtools = true

Vue.use(store)

new Vue({
  render: (h) => h(App, { props: { component: TestPage, name  } }),
}).$mount('#app')
