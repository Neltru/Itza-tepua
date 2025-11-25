<template>
  <div class="stat-card">
    <div class="stat-header">
      <span class="stat-icon" :style="{ background: iconColor }">
        {{ icon }}
      </span>
      <span class="stat-label">{{ label }}</span>
    </div>
    <div class="stat-value">
      <span v-if="isLoading" class="loading-text">--</span>
      <span v-else>{{ formattedValue }}</span>
    </div>
    <div class="stat-status" :class="statusClass">{{ currentStatus }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  icon: String,
  label: String,
  value: Number,
  unit: String,
  status: String,
  iconColor: String,
  isLoading: {
    type: Boolean,
    default: false
  },
  threshold: {
    type: Object,
    default: () => ({ warning: 60, critical: 80 })
  }
})

const formattedValue = computed(() => {
  if (props.isLoading || props.value === null || props.value === undefined) {
    return '--'
  }
  
  if (props.unit) {
    return `${props.value.toFixed(1)}${props.unit}`
  }
  return props.value.toFixed(1)
})

const currentStatus = computed(() => {
  if (props.isLoading) return 'Cargando...'
  if (props.status) return props.status
  
  // Calcular estado basado en umbrales
  if (props.value >= props.threshold.critical) return 'Crítico'
  if (props.value >= props.threshold.warning) return 'Alerta'
  return 'Normal'
})

const statusClass = computed(() => {
  if (props.isLoading) return 'loading'
  
  const status = currentStatus.value.toLowerCase()
  if (status.includes('crítico')) return 'critical'
  if (status.includes('alerta')) return 'warning'
  return 'normal'
})
</script>

<style scoped>
.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  transition: all 0.3s;
}

.stat-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.stat-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.stat-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #111827;
  margin-bottom: 0.5rem;
  font-family: 'Courier New', monospace;
}

.loading-text {
  color: #9ca3af;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.stat-status {
  font-size: 0.875rem;
  font-weight: 600;
}

.stat-status.normal {
  color: #22c55e;
}

.stat-status.warning {
  color: #f59e0b;
}

.stat-status.critical {
  color: #dc2626;
}

.stat-status.estable {
  color: #3b82f6;
}

.stat-status.loading {
  color: #9ca3af;
}
</style>