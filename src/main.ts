import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'

import App from './App.vue'
import router from './router'
import store from './store/'

// Sentry
import * as Sentry from '@sentry/browser'
import * as Integrations from '@sentry/integrations'
if (process.env.VUE_APP_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.VUE_APP_SENTRY_DSN,
    integrations: [new Integrations.Vue({ Vue, attachProps: true })]
  })
}

// cookies
import VueCookies from 'vue-cookies'
Vue.use(VueCookies)

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
import {
  faUserCircle,
  faCoins,
  faWrench,
  faTrashAlt,
  faSort,
  faSortUp,
  faSortDown,
  faDollarSign,
  faEdit,
  faCheck,
  faTimes,
  faChevronDown,
  faChevronUp,
  faBars,
  faArchive,
  faTrash,
  faInfoCircle,
  faExternalLinkAlt
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(
  faChevronDown,
  faChevronUp,
  faUserCircle,
  faCoins,
  faDollarSign,
  faWrench,
  faTrashAlt,
  faSort,
  faSortUp,
  faSortDown,
  faEdit,
  faCheck,
  faTimes,
  faBars,
  faArchive,
  faTrash,
  faInfoCircle,
  faExternalLinkAlt
)

Vue.component('font-awesome-icon', FontAwesomeIcon)

// Intro.js
import VueIntro from 'vue-introjs'
declare module 'vue/types/vue' {
  interface Vue {
    readonly $intro: any
  }
}
Vue.use(VueIntro)
import 'intro.js/introjs.css'
import 'intro.js/themes/introjs-modern.css'

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
Vue.component('component-bid-' + ApiAuctionType.VCG, BundleBid)
Vue.component('component-bid-' + ApiAuctionType.CCA, BundleBid)
Vue.component('component-bid-' + ApiAuctionType.PVM, BundleBid)

// register auction-specific round-control
Vue.component('component-round-' + ApiAuctionType.SINGLE_ITEM_FIRST_PRICE, SingleRound)
Vue.component('component-round-' + ApiAuctionType.SINGLE_ITEM_SECOND_PRICE, SingleRound)
Vue.component('component-round-' + ApiAuctionType.SEQUENTIAL_FIRST_PRICE, MultiRound)
Vue.component('component-round-' + ApiAuctionType.SEQUENTIAL_SECOND_PRICE, MultiRound)
Vue.component('component-round-' + ApiAuctionType.SIMULTANEOUS_FIRST_PRICE, SingleRound)
Vue.component('component-round-' + ApiAuctionType.SIMULTANEOUS_SECOND_PRICE, SingleRound)
Vue.component('component-round-' + ApiAuctionType.VCG, SingleRound)
Vue.component('component-round-' + ApiAuctionType.CCA, MultiRound)
Vue.component('component-round-' + ApiAuctionType.PVM, MultiRound)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
