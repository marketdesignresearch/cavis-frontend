import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'

// element-ui css
import 'element-ui/lib/theme-chalk/index.css'

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
      path: '/auctions/result/:id',
      name: 'auction-result',
      component: () => import(/* webpackChunkName: "auction-result" */ './views/AuctionResult.vue')
    },
    {
      path: '/auctions/setup',
      name: 'auction-setup',
      component: () => import(/* webpackChunkName: "auction-setup" */ './views/AuctionSetup.vue')
    },
    {
      path: '/auctions/:id',
      name: 'auction',
      component: () => import(/* webpackChunkName: "auction" */ './views/Auction.vue')
    }
  ]
})
