<template>
  <div class="calendar-view">
    <div class="calendar-header">
      <button @click="previousMonth" class="nav-btn">◀</button>
      <h2>{{ monthYear }}</h2>
      <button @click="nextMonth" class="nav-btn">▶</button>
    </div>

    <div class="legend">
      <div class="legend-item">
        <span class="legend-color active"></span>
        <span>Actief Uitgeleend</span>
      </div>
      <div class="legend-item">
        <span class="legend-color overdue"></span>
        <span>Achterstallig</span>
      </div>
      <div class="legend-item">
        <span class="legend-color today"></span>
        <span>Vandaag</span>
      </div>
    </div>

    <div class="calendar-grid">
      <div class="weekday-header" v-for="day in weekDays" :key="day">{{ day }}</div>
      
      <div 
        v-for="(day, index) in calendarDays" 
        :key="index"
        class="calendar-day"
        :class="{ 
          'other-month': !day.isCurrentMonth, 
          'today': day.isToday,
          'has-events': day.events.length > 0
        }"
      >
        <div class="day-number">{{ day.date }}</div>
        <div class="day-events">
          <div 
            v-for="event in day.events.slice(0, 3)" 
            :key="event.id"
            class="event"
            :class="event.status"
            :title="`${event.title} - ${event.lent_to}`"
            @click="showEventDetails(event)"
          >
            <span class="event-title">{{ event.title }}</span>
          </div>
          <div v-if="day.events.length > 3" class="more-events">
            +{{ day.events.length - 3 }} meer
          </div>
        </div>
      </div>
    </div>

    <!-- Event Details Modal -->
    <div v-if="selectedEvent" class="modal-overlay" @click="selectedEvent = null">
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="selectedEvent = null">✕</button>
        <h3>{{ selectedEvent.title }}</h3>
        
        <div class="modal-details">
          <div v-if="selectedEvent.image_url" class="modal-image">
            <img :src="`${API_URL}${selectedEvent.image_url}`" :alt="selectedEvent.title" />
          </div>
          
          <div class="modal-info">
            <p><strong>Status:</strong> 
              <span :class="`status-badge ${selectedEvent.status}`">
                {{ selectedEvent.status === 'overdue' ? '🔴 Achterstallig' : '🟡 Uitgeleend' }}
              </span>
            </p>
            <p v-if="selectedEvent.category"><strong>Categorie:</strong> {{ selectedEvent.category }}</p>
            <p><strong>Uitgeleend aan:</strong> {{ selectedEvent.lent_to }}</p>
            <p v-if="selectedEvent.lent_email"><strong>📧 Email:</strong> <a :href="'mailto:' + selectedEvent.lent_email">{{ selectedEvent.lent_email }}</a></p>
            <p v-if="selectedEvent.lent_phone"><strong>📞 Telefoon:</strong> <a :href="'tel:' + selectedEvent.lent_phone">{{ selectedEvent.lent_phone }}</a></p>
            <p><strong>Sinds:</strong> {{ formatDate(selectedEvent.lent_date) }}</p>
            <p><strong>Retour verwacht:</strong> {{ formatDate(selectedEvent.due_date) }}</p>
            <p v-if="selectedEvent.daysOverdue > 0" class="overdue-warning">
              ⚠️ {{ selectedEvent.daysOverdue }} dagen te laat!
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { API_URL } from '../config.js'

const paintings = ref([])
const currentMonth = ref(new Date().getMonth())
const currentYear = ref(new Date().getFullYear())
const selectedEvent = ref(null)

const weekDays = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo']

const monthYear = computed(() => {
  const date = new Date(currentYear.value, currentMonth.value)
  return date.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })
})

const calendarDays = computed(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Adjust for Monday start (getDay() returns 0 for Sunday)
  let firstDayOfWeek = firstDay.getDay()
  firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1
  
  const days = []
  
  // Previous month days
  const prevMonthLastDay = new Date(currentYear.value, currentMonth.value, 0).getDate()
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const date = prevMonthLastDay - i
    const day = new Date(currentYear.value, currentMonth.value - 1, date)
    days.push({
      date: date,
      isCurrentMonth: false,
      isToday: false,
      events: getEventsForDay(day),
      fullDate: day
    })
  }
  
  // Current month days
  for (let date = 1; date <= lastDay.getDate(); date++) {
    const day = new Date(currentYear.value, currentMonth.value, date)
    const isToday = day.getTime() === today.getTime()
    days.push({
      date: date,
      isCurrentMonth: true,
      isToday: isToday,
      events: getEventsForDay(day),
      fullDate: day
    })
  }
  
  // Next month days to complete the grid
  const remainingDays = 42 - days.length // 6 weeks * 7 days
  for (let date = 1; date <= remainingDays; date++) {
    const day = new Date(currentYear.value, currentMonth.value + 1, date)
    days.push({
      date: date,
      isCurrentMonth: false,
      isToday: false,
      events: getEventsForDay(day),
      fullDate: day
    })
  }
  
  return days
})

function getEventsForDay(day) {
  const events = []
  const dayTime = day.getTime()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  paintings.value.forEach(painting => {
    if (!painting.lent_to || !painting.lent_date || !painting.due_date) return
    
    const lentDate = new Date(painting.lent_date)
    lentDate.setHours(0, 0, 0, 0)
    const dueDate = new Date(painting.due_date)
    dueDate.setHours(0, 0, 0, 0)
    
    // Check if this day falls within the lending period
    if (dayTime >= lentDate.getTime() && dayTime <= dueDate.getTime()) {
      const isOverdue = dueDate.getTime() < today.getTime()
      const daysOverdue = isOverdue ? Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0
      
      events.push({
        ...painting,
        status: isOverdue ? 'overdue' : 'active',
        daysOverdue: daysOverdue
      })
    }
  })
  
  return events
}

function previousMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

function showEventDetails(event) {
  selectedEvent.value = event
}

function formatDate(dateString) {
  if (!dateString) return 'N.v.t.'
  const date = new Date(dateString)
  return date.toLocaleDateString('nl-NL', { year: 'numeric', month: 'short', day: 'numeric' })
}

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

onMounted(() => {
  fetchPaintings()
})
</script>

<style scoped>
.calendar-view {
  max-width: 1400px;
  margin: 0 auto;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.calendar-header h2 {
  margin: 0;
  color: #333;
  font-size: 1.8em;
  text-transform: capitalize;
}

.nav-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.2em;
  transition: background 0.3s;
}

.nav-btn:hover {
  background: #764ba2;
}

.legend {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-color {
  width: 20px;
  height: 20px;
  border-radius: 4px;
}

.legend-color.active {
  background: #ffc107;
}

.legend-color.overdue {
  background: #dc3545;
}

.legend-color.today {
  background: #667eea;
  border: 2px solid #764ba2;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: #e0e0e0;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.weekday-header {
  background: #667eea;
  color: white;
  padding: 12px;
  text-align: center;
  font-weight: 600;
  font-size: 0.9em;
}

.calendar-day {
  background: white;
  min-height: 100px;
  padding: 8px;
  position: relative;
  cursor: pointer;
  transition: background 0.2s;
}

.calendar-day:hover {
  background: #f8f9fa;
}

.calendar-day.other-month {
  background: #f5f5f5;
  opacity: 0.5;
}

.calendar-day.today {
  background: #e8eeff;
  border: 2px solid #667eea;
}

.calendar-day.today .day-number {
  color: #667eea;
  font-weight: 700;
}

.day-number {
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
  font-size: 0.9em;
}

.day-events {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.event {
  background: #ffc107;
  color: #333;
  padding: 4px 6px;
  border-radius: 4px;
  font-size: 0.75em;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.event:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 10;
}

.event.overdue {
  background: #dc3545;
  color: white;
  font-weight: 600;
}

.event-title {
  font-weight: 500;
}

.more-events {
  font-size: 0.7em;
  color: #666;
  margin-top: 2px;
  font-style: italic;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 30px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.modal-close {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 1.5em;
  cursor: pointer;
  color: #666;
  padding: 5px;
  line-height: 1;
}

.modal-close:hover {
  color: #333;
}

.modal-content h3 {
  color: #333;
  margin-bottom: 20px;
  font-size: 1.8em;
}

.modal-details {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.modal-image {
  width: 100%;
  max-height: 300px;
  overflow: hidden;
  border-radius: 8px;
}

.modal-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.modal-info p {
  margin: 10px 0;
  color: #666;
}

.modal-info strong {
  color: #333;
}

.modal-info a {
  color: #667eea;
  text-decoration: none;
}

.modal-info a:hover {
  text-decoration: underline;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85em;
  font-weight: 600;
  display: inline-block;
}

.status-badge.active {
  background: #fff3cd;
  color: #856404;
}

.status-badge.overdue {
  background: #f8d7da;
  color: #721c24;
}

.overdue-warning {
  background: #f8d7da;
  color: #721c24;
  padding: 12px;
  border-radius: 8px;
  font-weight: 600;
  margin-top: 10px;
}

/* Responsive */
@media (max-width: 768px) {
  .calendar-day {
    min-height: 80px;
    padding: 4px;
  }
  
  .day-number {
    font-size: 0.8em;
  }
  
  .event {
    font-size: 0.65em;
    padding: 2px 4px;
  }
  
  .weekday-header {
    padding: 8px;
    font-size: 0.8em;
  }
  
  .legend {
    flex-wrap: wrap;
    gap: 10px;
  }
}
</style>
