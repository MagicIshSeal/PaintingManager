import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { API_URL } from '../config.js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isAuthenticated = computed(() => user.value !== null)
  const isLoading = ref(false)

  async function checkAuth() {
    try {
      const response = await fetch(`${API_URL}/api/auth/status`, {
        credentials: 'include'
      })
      const data = await response.json()
      if (data.authenticated) {
        user.value = data.user
      } else {
        user.value = null
      }
      return data.authenticated
    } catch (error) {
      console.error('Auth check failed:', error)
      user.value = null
      return false
    }
  }

  async function login(username, password) {
    isLoading.value = true
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ username, password })
      })

      const data = await response.json()

      if (response.ok) {
        user.value = data.user
        return { success: true }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error('Login failed:', error)
      return { success: false, error: 'Network error. Please try again.' }
    } finally {
      isLoading.value = false
    }
  }

  async function register(username, password) {
    isLoading.value = true
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ username, password })
      })

      const data = await response.json()

      if (response.ok) {
        user.value = data.user
        return { success: true }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error('Registration failed:', error)
      return { success: false, error: 'Network error. Please try again.' }
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      })
      user.value = null
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    checkAuth,
    login,
    register,
    logout
  }
})
