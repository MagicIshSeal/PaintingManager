import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import PaintingsView from '../views/PaintingView.vue'
import CalendarView from '../views/CalendarView.vue'
import LoginView from '../views/LoginView.vue'

const routes = [
  { 
    path: '/login', 
    name: 'login', 
    component: LoginView,
    meta: { requiresGuest: true }
  },
  { 
    path: '/', 
    redirect: '/paintings' 
  },
  { 
    path: '/paintings', 
    name: 'paintings', 
    component: PaintingsView,
    meta: { requiresAuth: true }
  },
  { 
    path: '/calendar', 
    name: 'calendar', 
    component: CalendarView,
    meta: { requiresAuth: true }
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard to check authentication
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Check auth status if not already checked
  if (authStore.user === null && !to.meta.requiresGuest) {
    await authStore.checkAuth()
  }
  
  // If route requires authentication and user is not authenticated
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  }
  // If route requires guest (login page) and user is authenticated
  else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/paintings')
  }
  // Otherwise, allow navigation
  else {
    next()
  }
})

export default router
