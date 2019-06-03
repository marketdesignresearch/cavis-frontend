import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'

import App from './App.vue'
import router from './router'
import store from './store/'

import BundleBid from './components/auction/bids/BundleBid.vue'

// bootstrap ui framework
Vue.use(BootstrapVue)
import './custom.scss'
import { ApiAuctionType } from './store/modules/auction'

// register auction-specific bid components
Vue.component('component-bid-' + ApiAuctionType.SINGLE_ITEM_FIRST_PRICE, BundleBid)
Vue.component('component-bid-' + ApiAuctionType.SINGLE_ITEM_SECOND_PRICE, BundleBid)
Vue.component('component-bid-' + ApiAuctionType.VCG_XOR, BundleBid)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
