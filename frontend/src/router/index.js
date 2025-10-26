import PaintingsView from '../views/PaintingView.vue'

const routes = [
  { path: '/', redirect: '/paintings' },
  { path: '/paintings', name: 'paintings', component: PaintingsView },
]
