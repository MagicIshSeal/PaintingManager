<script setup>
import { RouterView, useRouter, useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { computed } from 'vue'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const isPublicRoute = computed(() => route.path === '/' || route.path === '/login')

async function handleLogout() {
  await authStore.logout()
  router.push('/')
}
</script>

<template>
  <div id="app">
    <header v-if="authStore.isAuthenticated && !isPublicRoute">
      <div class="header-content">
        <div>
          <h1>🎨 Schilderijen Beheer</h1>
          <p>Beheerder Dashboard</p>
        </div>
        <div class="user-section">
          <nav class="nav-menu">
            <RouterLink to="/admin/paintings" class="nav-link" :class="{ active: route.path === '/admin/paintings' }">
              📋 Lijst
            </RouterLink>
            <RouterLink to="/admin/calendar" class="nav-link" :class="{ active: route.path === '/admin/calendar' }">
              📅 Kalender
            </RouterLink>
          </nav>
          <span class="username">👤 {{ authStore.user?.username }}</span>
          <button @click="handleLogout" class="logout-btn">Uitloggen</button>
        </div>
      </div>
    </header>
    <main :class="{ 'public-page': isPublicRoute }">
      <RouterView />
    </main>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  padding: 20px;
}

#app {
  max-width: 1200px;
  margin: 0 auto;
}

header {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

header h1 {
  color: #333;
  font-size: 2.5em;
  margin-bottom: 10px;
}

header p {
  color: #666;
  font-size: 1.1em;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.nav-menu {
  display: flex;
  gap: 10px;
}

.nav-link {
  padding: 10px 20px;
  background: #f0f0f0;
  color: #333;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s;
}

.nav-link:hover {
  background: #e0e0e0;
  transform: translateY(-2px);
}

.nav-link.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.username {
  color: #333;
  font-weight: 500;
}

.logout-btn {
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.logout-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

main {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

main.public-page {
  background: transparent;
  padding: 0;
  box-shadow: none;
  border-radius: 0;
}
</style>
