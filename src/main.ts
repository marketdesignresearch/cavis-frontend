import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'

import App from './App.vue'
import router from './router'
import store from './store/'

import BundleBid from './components/auction/bids/BundleBid.vue'
import SingleRound from './components/auction/rounds/SingleRound.vue'
import CCARound from './components/auction/rounds/CCARound.vue'

// bootstrap ui framework
Vue.use(BootstrapVue)
import './custom.scss'
import { ApiAuctionType } from './store/modules/auction'

// register auction-specific bid components
Vue.component('component-bid-' + ApiAuctionType.SINGLE_ITEM_FIRST_PRICE, BundleBid)
Vue.component('component-bid-' + ApiAuctionType.SINGLE_ITEM_SECOND_PRICE, BundleBid)
Vue.component('component-bid-' + ApiAuctionType.VCG_XOR, BundleBid)
Vue.component('component-bid-' + ApiAuctionType.CCA_VCG, BundleBid)

// register auction-specific round-control
Vue.component('component-round-' + ApiAuctionType.SINGLE_ITEM_FIRST_PRICE, SingleRound)
Vue.component('component-round-' + ApiAuctionType.SINGLE_ITEM_SECOND_PRICE, SingleRound)
Vue.component('component-round-' + ApiAuctionType.VCG_XOR, CCARound)
Vue.component('component-round-' + ApiAuctionType.CCA_VCG, CCARound)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
