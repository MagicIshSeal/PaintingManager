<template>
  <div class="landing-page">
    <!-- Hero Section -->
    <header class="hero">
      <div class="hero-content">
        <h1>🎨 Schilderijen Collectie</h1>
        <p class="subtitle">Ontdek onze prachtige kunstwerken</p>
        <div class="hero-stats">
          <div class="stat">
            <span class="stat-number">{{ paintings.length }}</span>
            <span class="stat-label">Schilderijen</span>
          </div>
          <div class="stat">
            <span class="stat-number">{{ availableCount }}</span>
            <span class="stat-label">Beschikbaar</span>
          </div>
          <div class="stat">
            <span class="stat-number">{{ categories.length }}</span>
            <span class="stat-label">Categorieën</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Category Filter -->
    <section class="filters">
      <div class="container">
        <div class="filter-buttons">
          <button 
            @click="selectedCategory = ''"
            :class="{ active: selectedCategory === '' }"
            class="filter-btn"
          >
            Alle ({{ paintings.length }})
          </button>
          <button 
            v-for="cat in categories" 
            :key="cat"
            @click="selectedCategory = cat"
            :class="{ active: selectedCategory === cat }"
            class="filter-btn"
          >
            {{ cat }} ({{ getCategoryCount(cat) }})
          </button>
        </div>
      </div>
    </section>

    <!-- Paintings Gallery -->
    <section class="gallery">
      <div class="container">
        <div v-if="filteredPaintings.length === 0" class="no-paintings">
          <p>Geen schilderijen gevonden in deze categorie</p>
        </div>
        <div v-else class="gallery-grid">
          <div 
            v-for="painting in filteredPaintings" 
            :key="painting.id"
            class="gallery-card"
            :class="{ unavailable: painting.lent_to }"
          >
            <div class="card-image">
              <img 
                v-if="painting.image_url" 
                :src="`${API_URL}${painting.image_url}`" 
                :alt="painting.title"
                loading="lazy"
              />
              <div v-else class="placeholder">🖼️</div>
              <div v-if="painting.lent_to" class="unavailable-badge">
                Uitgeleend
              </div>
            </div>
            <div class="card-content">
              <h3>{{ painting.title }}</h3>
              <div class="card-details">
                <p v-if="painting.category" class="category">
                  <span class="icon">🏷️</span>
                  {{ painting.category }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- About Section -->
    <section class="about">
      <div class="container">
        <h2>Over Onze Collectie</h2>
        <div class="about-content">
          <div class="about-card">
            <div class="about-icon">🎨</div>
            <h3>Familieatelier</h3>
            <p>Deze collectie bestaat uit de werken van onze vader, een gepassioneerd kunstenaar. Zijn schilderijen worden met trots beheerd door zijn twee zonen.</p>
          </div>
          <div class="about-card">
            <div class="about-icon">🖼️</div>
            <h3>Persoonlijke Collectie</h3>
            <p>Elk schilderij vertelt een verhaal en draagt de unieke stijl en visie van onze vader. Een leven lang kunstenaarschap gevangen in deze werken.</p>
          </div>
          <div class="about-card">
            <div class="about-icon">📋</div>
            <h3>Uitleenservice</h3>
            <p>Sommige werken zijn beschikbaar voor uitlening. Neem contact op voor meer informatie over beschikbaarheid en mogelijkheden.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact Section -->
    <section class="contact">
      <div class="container">
        <h2>Contact</h2>
        <div class="contact-content">
          <p class="contact-intro">Interesse in een van de schilderijen of vragen over de collectie? Neem gerust contact met ons op.</p>
          <div class="contact-info">
            <div class="contact-item">
              <span class="contact-icon">📧</span>
              <div class="contact-details">
                <strong>Email</strong>
                <a href="mailto:info@schilderijencollectie.nl">info@schilderijencollectie.nl</a>
              </div>
            </div>
            <div class="contact-item">
              <span class="contact-icon">📞</span>
              <div class="contact-details">
                <strong>Telefoon</strong>
                <a href="tel:+31612345678">+31 6 12 34 56 78</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="container">
        <p>&copy; {{ new Date().getFullYear() }} Schilderijen Collectie. Alle rechten voorbehouden.</p>
        <p class="footer-link">
          <a @click="$router.push('/login')">Beheerder Login</a>
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { API_URL } from '../config.js'

const paintings = ref([])
const categories = ref([])
const selectedCategory = ref('')

const filteredPaintings = computed(() => {
  if (!selectedCategory.value) return paintings.value
  return paintings.value.filter(p => p.category === selectedCategory.value)
})

const availableCount = computed(() => 
  paintings.value.filter(p => !p.lent_to).length
)

function getCategoryCount(category) {
  return paintings.value.filter(p => p.category === category).length
}

async function fetchPaintings() {
  try {
    // Public endpoint - no authentication required
    const res = await fetch(`${API_URL}/api/public/paintings`)
    if (res.ok) {
      paintings.value = await res.json()
    }
  } catch (error) {
    console.error('Error fetching paintings:', error)
  }
}

async function fetchCategories() {
  try {
    const res = await fetch(`${API_URL}/api/public/categories`)
    if (res.ok) {
      categories.value = await res.json()
    }
  } catch (error) {
    console.error('Error fetching categories:', error)
  }
}

onMounted(() => {
  fetchPaintings()
  fetchCategories()
})
</script>

<style scoped>
.landing-page {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%);
}

/* Hero Section */
.hero {
  background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%);
  color: white;
  padding: 80px 20px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.hero-content {
  max-width: 1200px;
  margin: 0 auto;
}

.hero h1 {
  font-size: 3.5em;
  margin: 0 0 20px 0;
  font-weight: 800;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  color: #ffffff;
}

.subtitle {
  font-size: 1.5em;
  margin: 0 0 40px 0;
  font-weight: 400;
  color: #f7fafc;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: 60px;
  margin: 40px 0;
  flex-wrap: wrap;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 3em;
  font-weight: 800;
  line-height: 1;
}

.stat-label {
  font-size: 1.1em;
  opacity: 0.9;
  margin-top: 8px;
}

/* Container */
.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Filters */
.filters {
  padding: 40px 20px;
  background: white;
  border-bottom: 2px solid #f0f0f0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.filter-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 12px 24px;
  background: #f8f9fa;
  border: 2px solid #e0e0e0;
  border-radius: 25px;
  font-size: 1em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  color: #555;
}

.filter-btn:hover {
  background: #e9ecef;
  transform: translateY(-2px);
}

.filter-btn.active {
  background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%);
  color: white;
  border-color: #4a5568;
  box-shadow: 0 4px 12px rgba(74, 85, 104, 0.3);
}

/* Gallery */
.gallery {
  padding: 60px 20px;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 30px;
}

.gallery-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  cursor: pointer;
}

.gallery-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.gallery-card.unavailable {
  opacity: 0.7;
}

.card-image {
  position: relative;
  width: 100%;
  height: 280px;
  overflow: hidden;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.gallery-card:hover .card-image img {
  transform: scale(1.05);
}

.placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 5em;
  color: #ccc;
}

.unavailable-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(237, 137, 54, 0.95);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9em;
  font-weight: 600;
  backdrop-filter: blur(10px);
}

.card-content {
  padding: 24px;
}

.card-content h3 {
  margin: 0 0 16px 0;
  font-size: 1.5em;
  color: #333;
}

.card-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card-details p {
  margin: 0;
  color: #666;
  font-size: 0.95em;
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon {
  font-size: 1.2em;
}

.category {
  color: #4a5568;
  font-weight: 600;
}

/* Contact Section */
.contact {
  padding: 80px 20px;
  background: linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%);
}

.contact h2 {
  text-align: center;
  font-size: 2.5em;
  color: #333;
  margin: 0 0 30px 0;
}

.contact-content {
  max-width: 800px;
  margin: 0 auto;
}

.contact-intro {
  text-align: center;
  font-size: 1.2em;
  color: #666;
  margin-bottom: 50px;
  line-height: 1.6;
}

.contact-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 30px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
}

.contact-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

.contact-icon {
  font-size: 2.5em;
  flex-shrink: 0;
}

.contact-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.contact-details strong {
  font-size: 1.1em;
  color: #333;
}

.contact-details a {
  color: #4a5568;
  text-decoration: none;
  font-size: 1.05em;
  transition: color 0.3s;
}

.contact-details a:hover {
  color: #2d3748;
  text-decoration: underline;
}

/* About Section */
.about {
  padding: 80px 20px;
  background: linear-gradient(to bottom, #ffffff 0%, #f8f9fa 100%);
}

.about h2 {
  text-align: center;
  font-size: 2.5em;
  color: #333;
  margin: 0 0 60px 0;
}

.about-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 40px;
}

.about-card {
  text-align: center;
  padding: 40px 30px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
}

.about-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

.about-icon {
  font-size: 4em;
  margin-bottom: 20px;
}

.about-card h3 {
  font-size: 1.5em;
  color: #333;
  margin: 0 0 16px 0;
}

.about-card p {
  color: #666;
  line-height: 1.6;
  margin: 0;
}

/* Footer */
.footer {
  background: #2d3748;
  color: white;
  padding: 40px 20px;
  text-align: center;
}

.footer p {
  margin: 8px 0;
  opacity: 0.9;
}

.footer-link a {
  color: #4a5568;
  text-decoration: none;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.3s;
}

.footer-link a:hover {
  color: #718096;
  text-decoration: underline;
}

.no-paintings {
  text-align: center;
  padding: 80px 20px;
  color: #999;
  font-size: 1.2em;
  grid-column: 1 / -1;
}

/* Responsive */
@media (max-width: 768px) {
  .hero h1 {
    font-size: 2.5em;
  }
  
  .subtitle {
    font-size: 1.2em;
  }
  
  .hero-stats {
    gap: 30px;
  }
  
  .stat-number {
    font-size: 2.5em;
  }
  
  .gallery-grid {
    grid-template-columns: 1fr;
  }
  
  .about h2 {
    font-size: 2em;
  }
  
  .filter-buttons {
    flex-direction: column;
  }
  
  .filter-btn {
    width: 100%;
  }
}
</style>
