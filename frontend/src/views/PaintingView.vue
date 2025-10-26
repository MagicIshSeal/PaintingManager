<template>
  <div>
    <h1>Paintings</h1>
    <ul>
      <li v-for="painting in paintings" :key="painting.id">
        {{ painting.title }} – {{ painting.artist }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const paintings = ref([])

onMounted(async () => {
  const res = await fetch('http://localhost:8080/api/paintings')
  paintings.value = await res.json()
})
</script>
