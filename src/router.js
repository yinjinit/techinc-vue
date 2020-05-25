import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

export default new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      name: 'Index',
      path: '/dashboard',
      component: () => import('@/views/dashboard/MyDashboard'),
      children: [
        {
          name: 'Map',
          path: '/map',
          component: () => import('@/views/dashboard/Map'),
        },
      ],
    },
    {
      name: 'Settings',
      path: '/settings',
      children: [
        {
          name: 'Users',
          path: 'users',
          component: () => import('@/views/settings/Users'),
        },
      ],
    },
    { path: '*', redirect: '/dashboard' },
  ],
})
