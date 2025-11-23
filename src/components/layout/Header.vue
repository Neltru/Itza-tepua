<template>
  <header class="header">
    <div class="header-content">
      <div class="header-left">
        <div class="logo">
          <svg width="40" height="40" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="18" fill="#3b82f6"/>
            <path d="M20 8 L20 20 L28 28" stroke="white" stroke-width="3" fill="none" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="header-info">
          <h1>Sistema Itza-Tepua</h1>
          <p>Vigilancia en Tiempo Real</p>
        </div>
      </div>
      <div class="header-right">
        <div class="status-indicator" :class="statusClass">
          <span class="status-dot"></span>
          <span class="status-text">{{ statusText }}</span>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  hasAlerts: Boolean
})

const devMode = ref(false)

const statusClass = computed(() => props.hasAlerts ? 'alert' : 'normal')
const statusText = computed(() => props.hasAlerts ? 'Alerta Activa' : 'Sistema Operando Normalmente')

const toggleDevMode = () => {
  devMode.value = !devMode.value
}
</script>

<style scoped>
.header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-content {
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo {
  animation: rotate 20s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.header-info h1 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
}

.header-info p {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-indicator.normal {
  background: #dcfce7;
  color: #14532d;
}

.status-indicator.alert {
  background: #fee2e2;
  color: #991b1b;
  animation: blink 2s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.status-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: currentColor;
  animation: pulse-dot 2s infinite;
}

@keyframes pulse-dot {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.5); }
}

.dev-mode-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.dev-mode-btn:hover {
  background: #f9fafb;
  border-color: #3b82f6;
}
</style>