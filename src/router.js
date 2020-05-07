import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

export default new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      name: 'Index',
      path: '/',
      component: () => import('@/views/Index'),
      children: [
        {
          name: 'My Dashboard',
          path: 'dashboard',
          component: () => import('@/views/dashboard/Dashboard'),
        },
        {
          name: 'Live Dashboard',
          path: 'dashboard/live',
          component: () => import('@/views/dashboard/LiveDashboard'),
        },
      ],
    },
    { path: '*', redirect: '/dashboard/live' },
  ],
})
