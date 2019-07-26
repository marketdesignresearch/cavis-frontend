import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'

import App from './App.vue'
import router from './router'
import store from './store/'

// filters
import './filters/numeral'
import './filters/date'

import BundleBid from './components/auction/bids/BundleBid.vue'
import SingleRound from './components/auction/rounds/SingleRound.vue'
import MultiRound from './components/auction/rounds/MultiRound.vue'

// bootstrap ui framework
Vue.use(BootstrapVue)

// font-awesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { faUserCircle, faCoins, faWrench, faTrashAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faUserCircle, faCoins, faWrench, faTrashAlt)

Vue.component('font-awesome-icon', FontAwesomeIcon)

import 'nprogress/nprogress.css'
import './custom.scss'
import { ApiAuctionType } from './store/modules/auction'

// register auction-specific bid components
Vue.component('component-bid-' + ApiAuctionType.SINGLE_ITEM_FIRST_PRICE, BundleBid)
Vue.component('component-bid-' + ApiAuctionType.SINGLE_ITEM_SECOND_PRICE, BundleBid)
Vue.component('component-bid-' + ApiAuctionType.SEQUENTIAL_FIRST_PRICE, BundleBid)
Vue.component('component-bid-' + ApiAuctionType.SEQUENTIAL_SECOND_PRICE, BundleBid)
Vue.component('component-bid-' + ApiAuctionType.SIMULTANEOUS_FIRST_PRICE, BundleBid)
Vue.component('component-bid-' + ApiAuctionType.SIMULTANEOUS_SECOND_PRICE, BundleBid)
Vue.component('component-bid-' + ApiAuctionType.VCG_XOR, BundleBid)
Vue.component('component-bid-' + ApiAuctionType.CCA_VCG, BundleBid)
//Vue.component('component-bid-' + ApiAuctionType.CCA_CCG, BundleBid)
Vue.component('component-bid-' + ApiAuctionType.PVM_VCG, BundleBid)
//Vue.component('component-bid-' + ApiAuctionType.PVM_CCG, BundleBid)

// register auction-specific round-control
Vue.component('component-round-' + ApiAuctionType.SINGLE_ITEM_FIRST_PRICE, SingleRound)
Vue.component('component-round-' + ApiAuctionType.SINGLE_ITEM_SECOND_PRICE, SingleRound)
Vue.component('component-round-' + ApiAuctionType.SEQUENTIAL_FIRST_PRICE, MultiRound)
Vue.component('component-round-' + ApiAuctionType.SEQUENTIAL_SECOND_PRICE, MultiRound)
Vue.component('component-round-' + ApiAuctionType.SIMULTANEOUS_FIRST_PRICE, SingleRound)
Vue.component('component-round-' + ApiAuctionType.SIMULTANEOUS_SECOND_PRICE, SingleRound)
Vue.component('component-round-' + ApiAuctionType.VCG_XOR, SingleRound)
Vue.component('component-round-' + ApiAuctionType.CCA_VCG, MultiRound)
//Vue.component('component-round-' + ApiAuctionType.CCA_CCG, CCARound)
Vue.component('component-round-' + ApiAuctionType.PVM_VCG, MultiRound)
//Vue.component('component-round-' + ApiAuctionType.PVM_CCG, CCARound)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
