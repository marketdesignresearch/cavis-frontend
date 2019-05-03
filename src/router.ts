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
      path: '/auction',
      name: 'auction',
      component: () => import(/* webpackChunkName: "auction" */ './views/Auction.vue')
    }
  ]
})
