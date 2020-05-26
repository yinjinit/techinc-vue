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
          path: '/dashboard',
          component: () => import('@/views/dashboard/MyDashboard'),
        }, {
          name: 'Map',
          path: '/dashboard/map',
          component: () => import('@/views/dashboard/Map'),
        }, {
          name: 'Users',
          path: '/settings/users',
          component: () => import('@/views/settings/Users'),
        },
      ],
    },
    { path: '*', redirect: '/dashboard' },
  ],
})
