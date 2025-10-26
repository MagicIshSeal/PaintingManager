import { createRouter, createWebHistory } from 'vue-router'
import PaintingsView from '../views/PaintingView.vue'

const routes = [
  { path: '/', redirect: '/paintings' },
  { path: '/paintings', name: 'paintings', component: PaintingsView },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
