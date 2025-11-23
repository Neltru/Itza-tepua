import { createRouter, createWebHistory } from 'vue-router'
import MonitoringDashboard from '@/views/MonitoringDashboard.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'monitoring',
      component: MonitoringDashboard,
      meta: { title: 'Monitoreo de Derrumbes' }
    }
  ]
})

// Update page title
router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'Sistema de Monitoreo'
  next()
})

export default router