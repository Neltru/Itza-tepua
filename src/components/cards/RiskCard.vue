<template>
  <div class="risk-card">
    <h3 class="risk-title">
      ⚠️ Zonas en Riesgo
    </h3>
    <div class="risk-count">
      <div class="count-circle" :class="riskClass">
        {{ totalRiskZones }}
      </div>
      <p class="count-label">{{ label }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  totalRiskZones: Number
})

const riskClass = computed(() => {
  if (props.totalRiskZones === 0) return 'safe'
  if (props.totalRiskZones <= 2) return 'warning'
  return 'critical'
})

const label = computed(() => {
  if (props.totalRiskZones === 0) return 'Zonas seguras'
  if (props.totalRiskZones === 1) return 'Zona total'
  return 'Zonas totales'
})
</script>

<style scoped>
.risk-card {
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  transition: all 0.3s;
}

.risk-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.risk-title {
  margin: 0 0 1rem 0;
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.risk-count {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.count-circle {
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: bold;
  color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.count-circle.safe {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
}

.count-circle.warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  animation: pulse-warning 2s infinite;
}

.count-circle.critical {
  background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
  animation: pulse-critical 1.5s infinite;
}

@keyframes pulse-warning {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes pulse-critical {
  0%, 100% { 
    transform: scale(1); 
    box-shadow: 0 4px 6px rgba(220, 38, 38, 0.3);
  }
  50% { 
    transform: scale(1.1); 
    box-shadow: 0 8px 20px rgba(220, 38, 38, 0.5);
  }
}

.count-label {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}
</style>