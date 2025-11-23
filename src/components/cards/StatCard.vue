<template>
  <div class="stat-card">
    <div class="stat-header">
      <span class="stat-icon" :style="{ background: iconColor }">
        {{ icon }}
      </span>
      <span class="stat-label">{{ label }}</span>
    </div>
    <div class="stat-value">{{ formattedValue }}</div>
    <div class="stat-status" :class="statusClass">{{ status }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  icon: String,
  label: String,
  value: Number,
  unit: String,
  status: { type: String, default: 'Normal' },
})

const formattedValue = computed(() => {
  if (props.unit) {
    return `${props.value.toFixed(1)}${props.unit}`
  }
  return props.value.toFixed(1)
})

const statusClass = computed(() => {
  return props.status.toLowerCase()
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
}

.stat-status {
  font-size: 0.875rem;
  font-weight: 500;
}

.stat-status.normal {
  color: #22c55e;
}

.stat-status.estable {
  color: #3b82f6;
}
</style>