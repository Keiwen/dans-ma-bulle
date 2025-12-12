import { createRouter, createWebHashHistory } from 'vue-router'
import ReadView from '../views/ReadView.vue'
import BookSelection from '../views/BookSelectionView'

const routes = [
  {
    path: '/',
    name: 'read',
    component: ReadView
  },
  {
    path: '/book',
    name: 'book',
    component: BookSelection
  },
  {
    path: '/settings',
    name: 'settings',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/SettingsView')
  },
  {
    path: '/setup',
    name: 'setup',
    component: () => import(/* webpackChunkName: "about" */ '../views/SetupView.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
