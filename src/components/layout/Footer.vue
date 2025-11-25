<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-left">
        <p class="footer-text">
          © {{ currentYear }} Sistema Itza-Tepua
        </p>
      </div>
      
      <div class="footer-center">
        <span class="status-indicator">
          <span class="status-dot" :class="{ online: isOnline }"></span>
          {{ isOnline ? 'Sistema Operativo' : 'Sin Conexión' }}
        </span>
      </div>

      <div class="footer-right">
        <a href="#" class="footer-link">Ayuda</a>
        <span class="separator">·</span>
        <a href="#" class="footer-link">Documentación</a>
        <span class="separator">·</span>
        <a href="#" class="footer-link">Contacto</a>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const currentYear = computed(() => new Date().getFullYear())
const isOnline = ref(navigator.onLine)

const updateOnlineStatus = () => {
  isOnline.value = navigator.onLine
}

onMounted(() => {
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)
})

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus)
  window.removeEventListener('offline', updateOnlineStatus)
})
</script>

<style scoped>
.footer {
  background: white;
  border-top: 1px solid #e5e7eb;
  margin-top: auto;
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.footer-left {
  flex: 1;
}

.footer-text {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.footer-center {
  flex: 0 0 auto;
}

.status-indicator {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ef4444;
  transition: all 0.3s;
}

.status-dot.online {
  background: #22c55e;
  box-shadow: 0 0 8px rgba(34, 197, 94, 0.5);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.footer-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.75rem;
}

.footer-link {
  font-size: 0.875rem;
  color: #6b7280;
  text-decoration: none;
  transition: color 0.2s;
}

.footer-link:hover {
  color: #111827;
}

.separator {
  color: #d1d5db;
  user-select: none;
}

/* Responsive */
@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    text-align: center;
    padding: 1.25rem 1rem;
  }

  .footer-left,
  .footer-right {
    flex: none;
  }

  .footer-right {
    justify-content: center;
  }
}
</style>