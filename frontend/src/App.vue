<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <div id="app">
    <header>
      <h1>🎨 Schilderijen Beheer</h1>
      <p>Beheerder Dashboard</p>
    </header>
    <main>
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
  text-align: center;
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

main {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>
