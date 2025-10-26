<template>
  <div class="painting-manager">
    <!-- Add New Painting Form -->
    <div class="add-painting-section">
      <h2>{{ editingId ? 'Schilderij Bewerken' : 'Nieuw Schilderij Toevoegen' }}</h2>
      <form @submit.prevent="editingId ? updatePainting() : addPainting()" class="painting-form">
        <div class="form-row">
          <div class="form-group full-width">
            <label>Titel *</label>
            <input v-model="form.title" type="text" placeholder="bijv. De Sterrennacht" required />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group full-width">
            <label>Afbeelding</label>
            <div class="image-upload-container">
              <input 
                ref="fileInput"
                type="file" 
                @change="handleImageSelect" 
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                class="file-input"
                id="image-upload"
              />
              <label for="image-upload" class="file-label">
                📷 {{ imageFileName || 'Kies een afbeelding' }}
              </label>
              <div v-if="imagePreview || form.image_url" class="image-preview">
                <img :src="imagePreview || `http://localhost:8080${form.image_url}`" alt="Preview" />
                <button type="button" @click="clearImage" class="btn-clear-image">✕</button>
              </div>
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group full-width">
            <label>Adres</label>
            <input v-model="form.address" type="text" placeholder="bijv. Kerkstraat 123, 1234 AB Amsterdam" />
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Categorie</label>
            <div class="category-input-wrapper">
              <input 
                v-model="form.category" 
                type="text" 
                list="categories" 
                placeholder="Selecteer of typ nieuwe categorie"
                @focus="showCategoryDropdown = true"
                @blur="hideCategoryDropdown"
                @input="filterCategories"
                class="category-input"
              />
              <div v-if="showCategoryDropdown && filteredCategories.length > 0" class="category-dropdown">
                <div 
                  v-for="cat in filteredCategories" 
                  :key="cat" 
                  class="category-option"
                  @mousedown.prevent="selectCategory(cat)"
                >
                  {{ cat }}
                </div>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label>Uitgeleend Aan</label>
            <input v-model="form.lent_to" type="text" placeholder="Naam lener (leeg laten indien beschikbaar)" @input="handleLentToChange" />
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Email Lener</label>
            <input v-model="form.lent_email" type="email" placeholder="email@voorbeeld.nl" :disabled="!form.lent_to" />
          </div>
          <div class="form-group">
            <label>Telefoon Lener</label>
            <input v-model="form.lent_phone" type="tel" placeholder="06-12345678" :disabled="!form.lent_to" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Uitgeleend op Datum</label>
            <input v-model="form.lent_date" type="date" :disabled="!form.lent_to" />
          </div>
          <div class="form-group">
            <label>Retour Datum</label>
            <input v-model="form.due_date" type="date" :disabled="!form.lent_to" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group form-actions">
            <button type="submit" class="btn btn-primary">
              {{ editingId ? 'Bijwerken' : 'Toevoegen' }}
            </button>
            <button v-if="editingId" type="button" @click="cancelEdit" class="btn btn-secondary">
              Annuleren
            </button>
          </div>
        </div>
      </form>
    </div>

    <!-- Paintings List -->
    <div class="paintings-section">
      <h2>Schilderijen Collectie ({{ paintings.length }})</h2>
      
      <!-- Filter Tabs -->
      <div class="filter-tabs">
        <button 
          @click="filter = 'all'" 
          :class="{ active: filter === 'all' }"
          class="tab"
        >
          Alle ({{ paintings.length }})
        </button>
        <button 
          @click="filter = 'available'" 
          :class="{ active: filter === 'available' }"
          class="tab"
        >
          Beschikbaar ({{ availableCount }})
        </button>
        <button 
          @click="filter = 'lent'" 
          :class="{ active: filter === 'lent' }"
          class="tab"
        >
          Uitgeleend ({{ lentCount }})
        </button>
      </div>

      <!-- Category Filter -->
      <div v-if="categories.length > 0" class="category-filter">
        <label>Filter op Categorie:</label>
        <select v-model="categoryFilter" class="category-select">
          <option value="">Alle Categorieën</option>
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
      </div>

      <div v-if="filteredPaintings.length === 0" class="no-paintings">
        <p>{{ filter === 'all' ? 'Nog geen schilderijen. Voeg je eerste schilderij toe!' : `Geen ${filter === 'available' ? 'beschikbare' : 'uitgeleende'} schilderijen.` }}</p>
      </div>

      <div v-else class="paintings-grid">
        <div 
          v-for="painting in filteredPaintings" 
          :key="painting.id" 
          class="painting-card"
          :class="{ lent: painting.lent_to }"
        >
          <div v-if="painting.image_url" class="painting-image">
            <img :src="`http://localhost:8080${painting.image_url}`" :alt="painting.title" />
          </div>
          <div v-else class="painting-image-placeholder">
            🖼️
          </div>
          
          <div class="painting-header">
            <h3>{{ painting.title }}</h3>
            <span class="status-badge" :class="painting.lent_to ? 'lent' : 'available'">
              {{ painting.lent_to ? '🔴 Uitgeleend' : '🟢 Beschikbaar' }}
            </span>
          </div>
          
          <p v-if="painting.address" class="address"><strong>📍 Adres:</strong> {{ painting.address }}</p>
          <p v-if="painting.category" class="category"><strong>Categorie:</strong> {{ painting.category }}</p>
          
          <div v-if="painting.lent_to" class="lending-info">
            <p><strong>Uitgeleend aan:</strong> {{ painting.lent_to }}</p>
            <p v-if="painting.lent_email"><strong>📧 Email:</strong> <a :href="'mailto:' + painting.lent_email">{{ painting.lent_email }}</a></p>
            <p v-if="painting.lent_phone"><strong>📞 Telefoon:</strong> <a :href="'tel:' + painting.lent_phone">{{ painting.lent_phone }}</a></p>
            <p v-if="painting.lent_date"><strong>Sinds:</strong> {{ formatDate(painting.lent_date) }}</p>
            <p v-if="painting.due_date"><strong>Retour:</strong> {{ formatDate(painting.due_date) }}</p>
          </div>
          
          <div class="card-actions">
            <button @click="startEdit(painting)" class="btn btn-edit">✏️ Bewerken</button>
            <button @click="deletePainting(painting.id)" class="btn btn-delete">🗑️ Verwijderen</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const paintings = ref([])
const categories = ref([])
const filter = ref('all')
const categoryFilter = ref('')
const editingId = ref(null)
const imageFile = ref(null)
const imagePreview = ref(null)
const imageFileName = ref('')
const fileInput = ref(null)
const showCategoryDropdown = ref(false)
const filteredCategories = ref([])

const form = ref({
  title: '',
  address: '',
  category: '',
  image_url: '',
  lent_to: '',
  lent_email: '',
  lent_phone: '',
  lent_date: '',
  due_date: ''
})

const filteredPaintings = computed(() => {
  let result = paintings.value
  
  // Filter by status (all, available, lent)
  if (filter.value === 'available') {
    result = result.filter(p => !p.lent_to)
  } else if (filter.value === 'lent') {
    result = result.filter(p => p.lent_to)
  }
  
  // Filter by category
  if (categoryFilter.value) {
    result = result.filter(p => p.category === categoryFilter.value)
  }
  
  return result
})

const availableCount = computed(() => paintings.value.filter(p => !p.lent_to).length)
const lentCount = computed(() => paintings.value.filter(p => p.lent_to).length)

async function fetchPaintings() {
  try {
    const res = await fetch('http://localhost:8080/api/paintings')
    paintings.value = await res.json()
  } catch (error) {
    console.error('Error fetching paintings:', error)
  }
}

async function fetchCategories() {
  try {
    const res = await fetch('http://localhost:8080/api/categories')
    categories.value = await res.json()
    filteredCategories.value = categories.value
  } catch (error) {
    console.error('Error fetching categories:', error)
  }
}

function filterCategories() {
  const search = form.value.category.toLowerCase()
  if (search) {
    filteredCategories.value = categories.value.filter(cat => 
      cat.toLowerCase().includes(search)
    )
  } else {
    filteredCategories.value = categories.value
  }
  showCategoryDropdown.value = true
}

function selectCategory(category) {
  form.value.category = category
  showCategoryDropdown.value = false
}

function hideCategoryDropdown() {
  setTimeout(() => {
    showCategoryDropdown.value = false
  }, 200)
}

function handleImageSelect(event) {
  const file = event.target.files[0]
  if (file) {
    imageFile.value = file
    imageFileName.value = file.name
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

function clearImage() {
  imageFile.value = null
  imagePreview.value = null
  imageFileName.value = ''
  form.value.image_url = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

function handleLentToChange() {
  // Set lent_date to today when lent_to is filled for the first time
  if (form.value.lent_to && !form.value.lent_date) {
    const today = new Date().toISOString().split('T')[0]
    form.value.lent_date = today
  }
  // Clear dates and contact info when lent_to is empty
  if (!form.value.lent_to) {
    form.value.lent_email = ''
    form.value.lent_phone = ''
    form.value.lent_date = ''
    form.value.due_date = ''
  }
}

async function addPainting() {
  try {
    const formData = new FormData()
    formData.append('title', form.value.title)
    formData.append('address', form.value.address || '')
    formData.append('category', form.value.category || '')
    formData.append('lent_to', form.value.lent_to || '')
    formData.append('lent_email', form.value.lent_email || '')
    formData.append('lent_phone', form.value.lent_phone || '')
    formData.append('lent_date', form.value.lent_date || '')
    formData.append('due_date', form.value.due_date || '')
    
    if (imageFile.value) {
      formData.append('image', imageFile.value)
    }
    
    const res = await fetch('http://localhost:8080/api/paintings', {
      method: 'POST',
      body: formData
    })
    if (res.ok) {
      await fetchPaintings()
      await fetchCategories()
      resetForm()
    }
  } catch (error) {
    console.error('Error adding painting:', error)
  }
}

async function updatePainting() {
  try {
    const formData = new FormData()
    formData.append('title', form.value.title)
    formData.append('address', form.value.address || '')
    formData.append('category', form.value.category || '')
    formData.append('lent_to', form.value.lent_to || '')
    formData.append('lent_email', form.value.lent_email || '')
    formData.append('lent_phone', form.value.lent_phone || '')
    formData.append('lent_date', form.value.lent_date || '')
    formData.append('due_date', form.value.due_date || '')
    
    if (imageFile.value) {
      formData.append('image', imageFile.value)
    }
    
    const res = await fetch(`http://localhost:8080/api/paintings/${editingId.value}`, {
      method: 'PUT',
      body: formData
    })
    if (res.ok) {
      await fetchPaintings()
      await fetchCategories()
      resetForm()
    }
  } catch (error) {
    console.error('Error updating painting:', error)
  }
}

async function deletePainting(id) {
  if (!confirm('Weet je zeker dat je dit schilderij wilt verwijderen?')) return
  
  try {
    const res = await fetch(`http://localhost:8080/api/paintings/${id}`, {
      method: 'DELETE'
    })
    if (res.ok) {
      await fetchPaintings()
    }
  } catch (error) {
    console.error('Error deleting painting:', error)
  }
}

function startEdit(painting) {
  editingId.value = painting.id
  form.value = { ...painting }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function cancelEdit() {
  resetForm()
}

function resetForm() {
  editingId.value = null
  imageFile.value = null
  imagePreview.value = null
  imageFileName.value = ''
  showCategoryDropdown.value = false
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  form.value = {
    title: '',
    address: '',
    category: '',
    image_url: '',
    lent_to: '',
    lent_email: '',
    lent_phone: '',
    lent_date: '',
    due_date: ''
  }
}

function formatDate(dateString) {
  if (!dateString) return 'N.v.t.'
  const date = new Date(dateString)
  return date.toLocaleDateString('nl-NL', { year: 'numeric', month: 'short', day: 'numeric' })
}

onMounted(() => {
  fetchPaintings()
  fetchCategories()
})
</script>

<style scoped>
.painting-manager {
  max-width: 1200px;
  margin: 0 auto;
}

h2 {
  color: #333;
  margin-bottom: 20px;
  font-size: 1.8em;
}

/* Add Painting Form */
.add-painting-section {
  margin-bottom: 40px;
  padding-bottom: 30px;
  border-bottom: 2px solid #f0f0f0;
}

.painting-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-weight: 600;
  margin-bottom: 8px;
  color: #555;
  font-size: 0.9em;
}

.form-group input {
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1em;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.form-group input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

/* Image Upload */
.image-upload-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.file-input {
  display: none;
}

.file-label {
  display: inline-block;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  text-align: center;
  transition: all 0.3s;
}

.file-label:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.image-preview {
  position: relative;
  width: 100%;
  max-width: 300px;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #e0e0e0;
}

.image-preview img {
  width: 100%;
  height: auto;
  display: block;
}

.btn-clear-image {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(220, 53, 69, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.btn-clear-image:hover {
  background: #dc3545;
  transform: scale(1.1);
}

.form-actions {
  display: flex;
  gap: 10px;
  align-items: flex-end;
}

/* Buttons */
.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  flex: 1;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

.btn-edit {
  background: #ffc107;
  color: #333;
  flex: 1;
}

.btn-edit:hover {
  background: #e0a800;
}

.btn-delete {
  background: #dc3545;
  color: white;
  flex: 1;
}

.btn-delete:hover {
  background: #c82333;
}

/* Filter Tabs */
.filter-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.tab {
  padding: 10px 20px;
  background: #f8f9fa;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.tab:hover {
  background: #e9ecef;
}

.tab.active {
  background: white;
  border-color: #667eea;
  color: #667eea;
}

/* Category Filter */
.category-filter {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.category-filter label {
  font-weight: 600;
  color: #555;
  white-space: nowrap;
}

.category-select {
  flex: 1;
  max-width: 300px;
  padding: 10px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1em;
  background: white;
  cursor: pointer;
  transition: border-color 0.3s;
}

.category-select:focus {
  outline: none;
  border-color: #667eea;
}

/* Category Input with Dropdown */
.category-input-wrapper {
  position: relative;
}

.category-input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1em;
  transition: border-color 0.3s;
}

.category-input:focus {
  outline: none;
  border-color: #667eea;
}

.category-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  max-height: 200px;
  overflow-y: auto;
  background: white;
  border: 2px solid #667eea;
  border-top: none;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.category-option {
  padding: 10px 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.category-option:hover {
  background: #f0f0ff;
  color: #667eea;
}

/* Paintings Grid */
.paintings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.painting-card {
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s;
}

.painting-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
}

.painting-card.lent {
  border-color: #ffc107;
  background: #fffbf0;
}

.painting-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
  border-radius: 8px;
  margin-bottom: 15px;
}

.painting-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.painting-image-placeholder {
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 15px;
  font-size: 4em;
  color: #ccc;
}

.painting-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.painting-header h3 {
  color: #333;
  font-size: 1.3em;
  margin: 0;
  flex: 1;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85em;
  font-weight: 600;
  white-space: nowrap;
}

.status-badge.available {
  background: #d4edda;
  color: #155724;
}

.status-badge.lent {
  background: #fff3cd;
  color: #856404;
}

.painting-card p {
  margin: 8px 0;
  color: #666;
}

.artist {
  font-size: 1.1em;
  color: #555;
}

.lending-info {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
  margin: 15px 0;
}

.lending-info a {
  color: #667eea;
  text-decoration: none;
}

.lending-info a:hover {
  text-decoration: underline;
}

.card-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.no-paintings {
  text-align: center;
  padding: 60px 20px;
  color: #999;
  font-size: 1.1em;
}

/* Responsive */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .paintings-grid {
    grid-template-columns: 1fr;
  }
  
  .filter-tabs {
    flex-direction: column;
  }
}
</style>
