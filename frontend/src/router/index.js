import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import LandingView from '../views/LandingView.vue'
import PaintingsView from '../views/PaintingView.vue'
import CalendarView from '../views/CalendarView.vue'
import LoginView from '../views/LoginView.vue'

const routes = [
  { 
    path: '/', 
    name: 'home',
    component: LandingView,
    meta: { public: true }
  },
  { 
    path: '/login', 
    name: 'login', 
    component: LoginView,
    meta: { requiresGuest: true }
  },
  { 
    path: '/admin', 
    redirect: '/admin/paintings' 
  },
  { 
    path: '/admin/paintings', 
    name: 'paintings', 
    component: PaintingsView,
    meta: { requiresAuth: true }
  },
  { 
    path: '/admin/calendar', 
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
  
  // Allow public routes without checking auth
  if (to.meta.public) {
    next()
    return
  }
  
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
    next('/admin/paintings')
  }
  // Otherwise, allow navigation
  else {
    next()
  }
})

export default router
