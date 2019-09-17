import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/auctions',
      name: 'auction-list',
      component: () => import(/* webpackChunkName: "auction-list" */ './views/AuctionList.vue')
    },
    {
      path: '/auctions/archive',
      name: 'auction-archive',
      component: () => import(/* webpackChunkName: "auction-archive" */ './views/AuctionArchive.vue')
    },
    {
      path: '/auctions/result',
      name: 'auction-result',
      component: () => import(/* webpackChunkName: "auction-result" */ './views/AuctionResult.vue')
    },
    {
      path: '/auctions/create',
      name: 'auction-create',
      component: () => import(/* webpackChunkName: "auction-setup" */ './views/AuctionSetupChoose.vue')
    },
    {
      path: '/auctions/customize',
      name: 'auction-customize',
      component: () => import(/* webpackChunkName: "auction-setup" */ './views/AuctionSetupCustomize.vue')
    },
    {
      path: '/auctions/:id',
      name: 'auction',
      component: () => import(/* webpackChunkName: "auction" */ './views/Auction.vue')
    },
    {
      path: '/faq',
      name: 'faq',
      component: () => import(/* webpackChunkName: "faq" */ './views/Faq.vue')
    },
    {
      path: '/about',
      name: 'about',
      component: () => import(/* webpackChunkName: "about" */ './views/About.vue')
    }
  ]
})
