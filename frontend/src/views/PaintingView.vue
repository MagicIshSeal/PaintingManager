<template>
  <div class="painting-manager">
    <!-- Header with Add Button -->
    <div class="header-section">
      <h2>Schilderijen Collectie ({{ paintings.length }})</h2>
      <button @click="showAddModal = true" class="btn btn-add">
        ➕ Nieuw Schilderij
      </button>
    </div>

    <!-- Paintings Overview -->
    <div class="paintings-section">
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
        <button 
          @click="filter = 'overdue'" 
          :class="{ active: filter === 'overdue' }"
          class="tab tab-overdue"
        >
          Achterstallig ({{ overdueCount }})
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
            <img :src="`${API_URL}${painting.image_url}`" :alt="painting.title" />
          </div>
          <div v-else class="painting-image-placeholder">
            🖼️
          </div>
          
          <div class="painting-header">
            <h3>{{ painting.title }}</h3>
            <span class="status-badge" :class="getStatusClass(painting)">
              {{ getStatusText(painting) }}
            </span>
          </div>
          
          <p v-if="painting.address" class="address"><strong>📍 Locatie:</strong> {{ painting.address }}</p>
          <p v-if="painting.category" class="category"><strong>Categorie:</strong> {{ painting.category }}</p>
          
          <div v-if="painting.lent_to" class="lending-info">
            <p><strong>Uitgeleend aan:</strong> {{ painting.lent_to }}</p>
            <p v-if="painting.due_date"><strong>Retour:</strong> {{ formatDate(painting.due_date) }}</p>
            <p v-if="isOverdue(painting)" class="overdue-warning">
              ⚠️ {{ getDaysOverdue(painting) }} dagen te laat!
            </p>
          </div>
          
          <div class="card-actions">
            <button 
              v-if="!painting.lent_to" 
              @click="openLendModal(painting)" 
              class="btn btn-lend"
            >
              � Uitlenen
            </button>
            <button 
              v-else 
              @click="openManageLendModal(painting)" 
              class="btn btn-manage-lend"
            >
              📋 Uitlening Beheren
            </button>
            <button @click="openEditModal(painting)" class="btn btn-edit">
              ⚙️
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal || showEditModal" class="modal-overlay" @click="closeModals">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ showEditModal ? 'Schilderij Bewerken' : 'Nieuw Schilderij Toevoegen' }}</h2>
          <button @click="closeModals" class="btn-close">✕</button>
        </div>
        <form @submit.prevent="showEditModal ? updatePainting() : addPainting()" class="painting-form">
          <div class="form-group">
            <label>Titel *</label>
            <input v-model="form.title" type="text" placeholder="bijv. De Sterrennacht" required />
          </div>

          <div class="form-group">
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
                <img :src="imagePreview || `${API_URL}${form.image_url}`" alt="Preview" />
                <button type="button" @click="clearImage" class="btn-clear-image">✕</button>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>Locatie / Adres</label>
            <input v-model="form.address" type="text" placeholder="bijv. Kerkstraat 123, Amsterdam" />
          </div>
          
          <div class="form-group">
            <label>Categorie</label>
            <div class="category-input-wrapper">
              <input 
                v-model="form.category" 
                type="text" 
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

          <div class="modal-actions">
            <button type="submit" class="btn btn-primary">
              {{ showEditModal ? 'Opslaan' : 'Toevoegen' }}
            </button>
            <button v-if="showEditModal" type="button" @click="confirmDelete" class="btn btn-delete">
              🗑️ Verwijderen
            </button>
            <button type="button" @click="closeModals" class="btn btn-secondary">
              Annuleren
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Lend Out Modal -->
    <div v-if="showLendModal" class="modal-overlay" @click="closeLendModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>📤 Schilderij Uitlenen</h2>
          <button @click="closeLendModal" class="btn-close">✕</button>
        </div>
        <div class="painting-preview">
          <h3>{{ currentPainting?.title }}</h3>
          <div v-if="currentPainting?.image_url" class="preview-image">
            <img :src="`${API_URL}${currentPainting.image_url}`" :alt="currentPainting.title" />
          </div>
        </div>
        <form @submit.prevent="lendPainting" class="lending-form">
          <div class="form-group">
            <label>Uitgeleend Aan *</label>
            <input v-model="lendForm.lent_to" type="text" placeholder="Naam van de lener" required />
          </div>
          
          <div class="form-group">
            <label>Email</label>
            <input v-model="lendForm.lent_email" type="email" placeholder="email@voorbeeld.nl" />
          </div>
          
          <div class="form-group">
            <label>Telefoon</label>
            <input v-model="lendForm.lent_phone" type="tel" placeholder="06-12345678" />
          </div>

          <div class="form-group">
            <label>Uitgeleend op Datum</label>
            <input v-model="lendForm.lent_date" type="date" required />
          </div>
          
          <div class="form-group">
            <label>Retour Datum</label>
            <input v-model="lendForm.due_date" type="date" />
          </div>

          <div class="modal-actions">
            <button type="submit" class="btn btn-primary">
              Uitlenen
            </button>
            <button type="button" @click="closeLendModal" class="btn btn-secondary">
              Annuleren
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Manage Lending Modal -->
    <div v-if="showManageLendModal" class="modal-overlay" @click="closeManageLendModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>📋 Uitlening Beheren</h2>
          <button @click="closeManageLendModal" class="btn-close">✕</button>
        </div>
        <div class="painting-preview">
          <h3>{{ currentPainting?.title }}</h3>
          <div v-if="currentPainting?.image_url" class="preview-image">
            <img :src="`${API_URL}${currentPainting.image_url}`" :alt="currentPainting.title" />
          </div>
        </div>
        <div class="lending-details">
          <div class="detail-row">
            <strong>Uitgeleend aan:</strong>
            <span>{{ currentPainting?.lent_to }}</span>
          </div>
          <div v-if="currentPainting?.lent_email" class="detail-row">
            <strong>📧 Email:</strong>
            <a :href="'mailto:' + currentPainting.lent_email">{{ currentPainting.lent_email }}</a>
          </div>
          <div v-if="currentPainting?.lent_phone" class="detail-row">
            <strong>� Telefoon:</strong>
            <a :href="'tel:' + currentPainting.lent_phone">{{ currentPainting.lent_phone }}</a>
          </div>
          <div v-if="currentPainting?.lent_date" class="detail-row">
            <strong>Sinds:</strong>
            <span>{{ formatDate(currentPainting.lent_date) }}</span>
          </div>
          <div v-if="currentPainting?.due_date" class="detail-row">
            <strong>Retour verwacht:</strong>
            <span>{{ formatDate(currentPainting.due_date) }}</span>
          </div>
          <div v-if="isOverdue(currentPainting)" class="detail-row overdue">
            <strong>⚠️ Status:</strong>
            <span>{{ getDaysOverdue(currentPainting) }} dagen te laat!</span>
          </div>
        </div>
        <form @submit.prevent="updateLending" class="lending-form">
          <div class="form-group">
            <label>Uitgeleend Aan</label>
            <input v-model="lendForm.lent_to" type="text" />
          </div>
          
          <div class="form-group">
            <label>Email</label>
            <input v-model="lendForm.lent_email" type="email" />
          </div>
          
          <div class="form-group">
            <label>Telefoon</label>
            <input v-model="lendForm.lent_phone" type="tel" />
          </div>

          <div class="form-group">
            <label>Uitgeleend op Datum</label>
            <input v-model="lendForm.lent_date" type="date" />
          </div>
          
          <div class="form-group">
            <label>Retour Datum</label>
            <input v-model="lendForm.due_date" type="date" />
          </div>

          <div class="modal-actions">
            <button type="submit" class="btn btn-primary">
              Bijwerken
            </button>
            <button type="button" @click="returnPainting" class="btn btn-return">
              ✅ Teruggebracht
            </button>
            <button type="button" @click="closeManageLendModal" class="btn btn-secondary">
              Sluiten
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { API_URL } from '../config.js'

const paintings = ref([])
const categories = ref([])
const filter = ref('all')
const categoryFilter = ref('')
const editingId = ref(null)
const currentPainting = ref(null)
const imageFile = ref(null)
const imagePreview = ref(null)
const imageFileName = ref('')
const fileInput = ref(null)
const showCategoryDropdown = ref(false)
const filteredCategories = ref([])
const showAddModal = ref(false)
const showEditModal = ref(false)
const showLendModal = ref(false)
const showManageLendModal = ref(false)

const form = ref({
  title: '',
  address: '',
  category: '',
  image_url: ''
})

const lendForm = ref({
  lent_to: '',
  lent_email: '',
  lent_phone: '',
  lent_date: '',
  due_date: ''
})

const filteredPaintings = computed(() => {
  let result = paintings.value
  
  // Filter by status (all, available, lent, overdue)
  if (filter.value === 'available') {
    result = result.filter(p => !p.lent_to)
  } else if (filter.value === 'lent') {
    result = result.filter(p => p.lent_to && !isOverdue(p))
  } else if (filter.value === 'overdue') {
    result = result.filter(p => isOverdue(p))
  }
  
  // Filter by category
  if (categoryFilter.value) {
    result = result.filter(p => p.category === categoryFilter.value)
  }
  
  return result
})

const availableCount = computed(() => paintings.value.filter(p => !p.lent_to).length)
const lentCount = computed(() => paintings.value.filter(p => p.lent_to && !isOverdue(p)).length)
const overdueCount = computed(() => paintings.value.filter(p => isOverdue(p)).length)

async function fetchPaintings() {
  try {
    const res = await fetch(`${API_URL}/api/paintings`, {
      credentials: 'include'
    })
    if (!res.ok) throw new Error('Failed to fetch paintings')
    paintings.value = await res.json()
  } catch (error) {
    console.error('Error fetching paintings:', error)
  }
}

async function fetchCategories() {
  try {
    const res = await fetch(`${API_URL}/api/categories`, {
      credentials: 'include'
    })
    if (!res.ok) throw new Error('Failed to fetch categories')
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

function openEditModal(painting) {
  editingId.value = painting.id
  form.value = {
    title: painting.title,
    address: painting.address,
    category: painting.category,
    image_url: painting.image_url
  }
  showEditModal.value = true
}

function openLendModal(painting) {
  currentPainting.value = painting
  const today = new Date().toISOString().split('T')[0]
  lendForm.value = {
    lent_to: '',
    lent_email: '',
    lent_phone: '',
    lent_date: today,
    due_date: ''
  }
  showLendModal.value = true
}

function openManageLendModal(painting) {
  currentPainting.value = painting
  lendForm.value = {
    lent_to: painting.lent_to || '',
    lent_email: painting.lent_email || '',
    lent_phone: painting.lent_phone || '',
    lent_date: painting.lent_date || '',
    due_date: painting.due_date || ''
  }
  showManageLendModal.value = true
}

function closeModals() {
  showAddModal.value = false
  showEditModal.value = false
  resetForm()
}

function closeLendModal() {
  showLendModal.value = false
  currentPainting.value = null
  lendForm.value = {
    lent_to: '',
    lent_email: '',
    lent_phone: '',
    lent_date: '',
    due_date: ''
  }
}

function closeManageLendModal() {
  showManageLendModal.value = false
  currentPainting.value = null
  lendForm.value = {
    lent_to: '',
    lent_email: '',
    lent_phone: '',
    lent_date: '',
    due_date: ''
  }
}

async function addPainting() {
  try {
    const formData = new FormData()
    formData.append('title', form.value.title)
    formData.append('address', form.value.address || '')
    formData.append('category', form.value.category || '')
    formData.append('lent_to', '')
    formData.append('lent_email', '')
    formData.append('lent_phone', '')
    formData.append('lent_date', '')
    formData.append('due_date', '')
    
    if (imageFile.value) {
      formData.append('image', imageFile.value)
    }
    
    const res = await fetch(`${API_URL}/api/paintings`, {
      method: 'POST',
      credentials: 'include',
      body: formData
    })
    if (res.ok) {
      await fetchPaintings()
      await fetchCategories()
      closeModals()
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
    
    // Keep existing lending info when editing basic details
    const painting = paintings.value.find(p => p.id === editingId.value)
    formData.append('lent_to', painting?.lent_to || '')
    formData.append('lent_email', painting?.lent_email || '')
    formData.append('lent_phone', painting?.lent_phone || '')
    formData.append('lent_date', painting?.lent_date || '')
    formData.append('due_date', painting?.due_date || '')
    
    if (imageFile.value) {
      formData.append('image', imageFile.value)
    }
    
    const res = await fetch(`${API_URL}/api/paintings/${editingId.value}`, {
      method: 'PUT',
      credentials: 'include',
      body: formData
    })
    if (res.ok) {
      await fetchPaintings()
      await fetchCategories()
      closeModals()
    }
  } catch (error) {
    console.error('Error updating painting:', error)
  }
}

async function lendPainting() {
  try {
    const painting = paintings.value.find(p => p.id === currentPainting.value.id)
    const formData = new FormData()
    formData.append('title', painting.title)
    formData.append('address', painting.address || '')
    formData.append('category', painting.category || '')
    formData.append('lent_to', lendForm.value.lent_to)
    formData.append('lent_email', lendForm.value.lent_email || '')
    formData.append('lent_phone', lendForm.value.lent_phone || '')
    formData.append('lent_date', lendForm.value.lent_date)
    formData.append('due_date', lendForm.value.due_date || '')
    
    const res = await fetch(`${API_URL}/api/paintings/${currentPainting.value.id}`, {
      method: 'PUT',
      credentials: 'include',
      body: formData
    })
    if (res.ok) {
      await fetchPaintings()
      closeLendModal()
    }
  } catch (error) {
    console.error('Error lending painting:', error)
  }
}

async function updateLending() {
  try {
    const painting = paintings.value.find(p => p.id === currentPainting.value.id)
    const formData = new FormData()
    formData.append('title', painting.title)
    formData.append('address', painting.address || '')
    formData.append('category', painting.category || '')
    formData.append('lent_to', lendForm.value.lent_to)
    formData.append('lent_email', lendForm.value.lent_email || '')
    formData.append('lent_phone', lendForm.value.lent_phone || '')
    formData.append('lent_date', lendForm.value.lent_date)
    formData.append('due_date', lendForm.value.due_date || '')
    
    const res = await fetch(`${API_URL}/api/paintings/${currentPainting.value.id}`, {
      method: 'PUT',
      credentials: 'include',
      body: formData
    })
    if (res.ok) {
      await fetchPaintings()
      closeManageLendModal()
    }
  } catch (error) {
    console.error('Error updating lending:', error)
  }
}

async function returnPainting() {
  if (!confirm('Markeer dit schilderij als teruggebracht?')) return
  
  try {
    const painting = paintings.value.find(p => p.id === currentPainting.value.id)
    const formData = new FormData()
    formData.append('title', painting.title)
    formData.append('address', painting.address || '')
    formData.append('category', painting.category || '')
    formData.append('lent_to', '')
    formData.append('lent_email', '')
    formData.append('lent_phone', '')
    formData.append('lent_date', '')
    formData.append('due_date', '')
    
    const res = await fetch(`${API_URL}/api/paintings/${currentPainting.value.id}`, {
      method: 'PUT',
      credentials: 'include',
      body: formData
    })
    if (res.ok) {
      await fetchPaintings()
      closeManageLendModal()
    }
  } catch (error) {
    console.error('Error returning painting:', error)
  }
}

async function deletePainting(id) {
  if (!confirm('Weet je zeker dat je dit schilderij wilt verwijderen?')) return
  
  try {
    const res = await fetch(`${API_URL}/api/paintings/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    })
    if (res.ok) {
      await fetchPaintings()
    }
  } catch (error) {
    console.error('Error deleting painting:', error)
  }
}

function confirmDelete() {
  if (!confirm('Weet je zeker dat je dit schilderij wilt verwijderen?')) return
  deletePainting(editingId.value)
  closeModals()
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
    image_url: ''
  }
}

function formatDate(dateString) {
  if (!dateString) return 'N.v.t.'
  const date = new Date(dateString)
  return date.toLocaleDateString('nl-NL', { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatDateTime(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('nl-NL', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function isOverdue(painting) {
  if (!painting.lent_to || !painting.due_date) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dueDate = new Date(painting.due_date)
  dueDate.setHours(0, 0, 0, 0)
  return dueDate < today
}

function getDaysOverdue(painting) {
  if (!isOverdue(painting)) return 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dueDate = new Date(painting.due_date)
  dueDate.setHours(0, 0, 0, 0)
  return Math.floor((today - dueDate) / (1000 * 60 * 60 * 24))
}

function getStatusClass(painting) {
  if (!painting.lent_to) return 'available'
  if (isOverdue(painting)) return 'overdue'
  return 'lent'
}

function getStatusText(painting) {
  if (!painting.lent_to) return '🟢 Beschikbaar'
  if (isOverdue(painting)) return '🔴 Achterstallig'
  return '🟡 Uitgeleend'
}

onMounted(() => {
  fetchPaintings()
  fetchCategories()
})
</script>

<style scoped>
.painting-manager {
  max-width: 1400px;
  margin: 0 auto;
}

/* Header Section */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.header-section h2 {
  color: #333;
  margin: 0;
  font-size: 2em;
}

.btn-add {
  padding: 14px 28px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

/* Buttons */
.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 0.95em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
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
  background: #fff;
  color: #555;
  border: 2px solid #e0e0e0;
  padding: 8px 12px;
}

.btn-edit:hover {
  border-color: #667eea;
  color: #667eea;
}

.btn-delete {
  background: #dc3545;
  color: white;
}

.btn-delete:hover {
  background: #c82333;
}

.btn-lend {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  color: white;
  flex: 1;
}

.btn-lend:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(72, 187, 120, 0.4);
}

.btn-manage-lend {
  background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
  color: white;
  flex: 1;
}

.btn-manage-lend:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(237, 137, 54, 0.4);
}

.btn-return {
  background: #48bb78;
  color: white;
}

.btn-return:hover {
  background: #38a169;
}

/* Filter Tabs */
.filter-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.tab {
  padding: 12px 24px;
  background: #f8f9fa;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
  font-size: 1em;
}

.tab:hover {
  background: #e9ecef;
}

.tab.active {
  background: white;
  border-color: #667eea;
  color: #667eea;
}

.tab-overdue {
  color: #dc3545;
}

.tab-overdue.active {
  border-color: #dc3545;
  color: #dc3545;
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

/* Paintings Grid */
.paintings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.painting-card {
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
}

.painting-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.painting-card.lent {
  border-color: #ed8936;
  background: linear-gradient(to bottom, #fffaf0 0%, #ffffff 100%);
}

.painting-image {
  width: 100%;
  height: 220px;
  overflow: hidden;
  border-radius: 8px;
  margin-bottom: 16px;
}

.painting-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.painting-image-placeholder {
  width: 100%;
  height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 4em;
  color: #ccc;
}

.painting-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  gap: 10px;
}

.painting-header h3 {
  color: #333;
  font-size: 1.4em;
  margin: 0;
  flex: 1;
  line-height: 1.3;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85em;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
}

.status-badge.available {
  background: #d4edda;
  color: #155724;
}

.status-badge.lent {
  background: #fff3cd;
  color: #856404;
}

.status-badge.overdue {
  background: #f8d7da;
  color: #721c24;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.painting-card p {
  margin: 8px 0;
  color: #666;
  font-size: 0.95em;
}

.lending-info {
  background: #f8f9fa;
  padding: 14px;
  border-radius: 8px;
  margin: 12px 0;
  border-left: 4px solid #ed8936;
}

.lending-info p {
  margin: 6px 0;
  font-size: 0.9em;
}

.lending-info strong {
  color: #333;
}

.overdue-warning {
  background: #f8d7da;
  color: #721c24;
  padding: 10px;
  border-radius: 6px;
  border-left: 4px solid #dc3545;
  font-weight: 600;
  margin-top: 10px;
  font-size: 0.9em;
}

.card-actions {
  display: flex;
  gap: 10px;
  margin-top: auto;
  padding-top: 16px;
}

.no-paintings {
  text-align: center;
  padding: 80px 20px;
  color: #999;
  font-size: 1.2em;
  grid-column: 1 / -1;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 28px;
  border-bottom: 2px solid #f0f0f0;
  position: sticky;
  top: 0;
  background: white;
  border-radius: 16px 16px 0 0;
  z-index: 10;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.6em;
  color: #333;
}

.btn-close {
  background: #f8f9fa;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
}

.btn-close:hover {
  background: #e9ecef;
  color: #333;
  transform: rotate(90deg);
}

.painting-form,
.lending-form {
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: #555;
  font-size: 0.95em;
}

.form-group input,
.form-group textarea {
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1em;
  transition: all 0.3s;
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.image-upload-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
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
  max-width: 400px;
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
  background: rgba(220, 53, 69, 0.95);
  color: white;
  border: none;
  border-radius: 50%;
  width: 34px;
  height: 34px;
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

.category-input-wrapper {
  position: relative;
}

.category-input {
  width: 100%;
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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
}

.category-option {
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.95em;
}

.category-option:hover {
  background: #f0f0ff;
  color: #667eea;
}

.painting-preview {
  padding: 20px 28px;
  background: linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%);
  border-bottom: 2px solid #f0f0f0;
}

.painting-preview h3 {
  margin: 0 0 12px 0;
  color: #333;
  font-size: 1.3em;
}

.preview-image {
  width: 100%;
  max-height: 250px;
  overflow: hidden;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
}

.preview-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.lending-details {
  padding: 20px 28px;
  background: #f8f9fa;
  border-bottom: 2px solid #f0f0f0;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #e0e0e0;
  gap: 16px;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row strong {
  color: #555;
  font-weight: 600;
  min-width: 140px;
}

.detail-row span,
.detail-row a {
  color: #333;
  text-align: right;
}

.detail-row a {
  color: #667eea;
  text-decoration: none;
}

.detail-row a:hover {
  text-decoration: underline;
}

.detail-row.overdue {
  background: #fff5f5;
  padding: 12px;
  border-radius: 6px;
  border: 2px solid #fc8181;
}

.detail-row.overdue strong,
.detail-row.overdue span {
  color: #c53030;
}

.modal-actions {
  display: flex;
  gap: 12px;
  padding-top: 8px;
  flex-wrap: wrap;
}

.modal-actions .btn {
  flex: 1;
  min-width: 120px;
}

/* Responsive */
@media (max-width: 768px) {
  .header-section {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .btn-add {
    width: 100%;
  }
  
  .filter-tabs {
    flex-direction: column;
  }
  
  .tab {
    width: 100%;
  }
  
  .paintings-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    max-width: 100%;
    max-height: 95vh;
  }
  
  .modal-header {
    padding: 20px;
  }
  
  .painting-form,
  .lending-form,
  .painting-preview,
  .lending-details {
    padding: 20px;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .modal-actions .btn {
    width: 100%;
  }
  
  .detail-row {
    flex-direction: column;
    gap: 4px;
  }
  
  .detail-row strong {
    min-width: auto;
  }
  
  .detail-row span,
  .detail-row a {
    text-align: left;
  }
}
</style>
