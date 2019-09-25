import Vue from 'vue'
import Router, { Route } from 'vue-router'
import { Store } from 'vuex'
import store, { RootState } from './store'

Vue.use(Router)

const oidcMiddleware: any = (store: Store<RootState>) => {
  return (to: Route, _from: Route, next: Function) => {
    store.dispatch('oidcCheckAccess', to).then((hasAccess: boolean) => {
      next()
    })
  }
}

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import(/* webpackChunkName: "home" */ './views/Home.vue')
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
    },
    {
      path: '/auth/login',
      name: 'auth-login',
      component: () => import(/* webpackChunkName: "login" */ './views/Login.vue')
    },
    {
      path: '/oidc-callback', // Needs to match redirectUri (redirect_uri if you use snake case) in you oidcSettings
      name: 'oidcCallback',
      component: () => import(/* webpackChunkName: "oidc-callback" */ '@/components/auth/oidc-callback.vue')
    }
  ]
})

router.beforeEach(oidcMiddleware(store))

export default router
