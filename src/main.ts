import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'

import App from './App.vue'
import router from './router'
import store from './store/'

// bootstrap ui framework
Vue.use(BootstrapVue)
import './custom.scss'

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
