<template>
  <div class="sensor-table-wrapper">
    <div class="table-header">
      <h3 class="table-title">📊 Tabla de Estadísticas por Sensor</h3>
      <button 
        v-if="!isLoading" 
        @click="$emit('reload')" 
        class="refresh-btn"
        title="Actualizar datos"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
    
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando sensores...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <p>⚠️ {{ error }}</p>
      <button @click="$emit('reload')" class="retry-btn">Reintentar</button>
    </div>

    <!-- Empty State -->
    <div v-else-if="!sensors || sensors.length === 0" class="empty-state">
      <p>📭 No hay sensores disponibles</p>
    </div>

    <!-- Table -->
    <div v-else class="table-container">
      <table>
        <thead>
          <tr>
            <th>Zona</th>
            <th>Humedad</th>
            <th>Inclinación</th>
            <th>Vibración</th>
            <th>Riesgo</th>
            <th>Actualización</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="sensor in sensors" 
            :key="sensor.id"
            :class="{ 'critical-row': getRiskLevel(sensor) === 'CRITICAL' }"
          >
            <td class="zone-cell">{{ sensor.zone }}</td>
            <td class="metric-cell">
              <span :class="getMetricClass(sensor.humidity, 'humidity')">
                {{ sensor.humidity.toFixed(1) }}%
              </span>
            </td>
            <td class="metric-cell">
              <span :class="getMetricClass(sensor.inclination, 'inclination')">
                {{ sensor.inclination.toFixed(1) }}°
              </span>
            </td>
            <td class="metric-cell">
              <span :class="getMetricClass(sensor.vibration, 'vibration')">
                {{ sensor.vibration }} Hz
              </span>
            </td>
            <td>
              <RiskBadge :level="getRiskLevel(sensor)" />
            </td>
            <td class="time-cell">{{ sensor.lastUpdate }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import RiskBadge from '../common/RiskBadge.vue'
import { SENSOR_THRESHOLDS } from '@/utils/constants'

defineProps({
  sensors: Array,
  getRiskLevel: Function,
  isLoading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null
  }
})

defineEmits(['reload'])

const getMetricClass = (value, type) => {
  const thresholds = SENSOR_THRESHOLDS[type]
  if (value >= thresholds.critical) return 'critical'
  if (value >= thresholds.warning) return 'warning'
  return 'normal'
}
</script>

<style scoped>
.sensor-table-wrapper {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.table-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.refresh-btn {
  padding: 0.5rem;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.refresh-btn:hover {
  background: #e5e7eb;
  transform: rotate(180deg);
}

.refresh-btn svg {
  color: #6b7280;
}

/* Loading, Error, Empty States */
.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  color: #6b7280;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state p {
  margin-bottom: 1rem;
  color: #dc2626;
}

.retry-btn {
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
}

.retry-btn:hover {
  background: #2563eb;
}

/* Table styles */
.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: #f9fafb;
}

th {
  padding: 0.75rem 1rem;
  text-align: left;
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  border-bottom: 2px solid #e5e7eb;
}

td {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

tbody tr {
  transition: background 0.2s;
}

tbody tr:hover {
  background: #f9fafb;
}

.critical-row {
  background: #fef2f2;
}

.critical-row:hover {
  background: #fee2e2;
}

.zone-cell {
  font-weight: 500;
  color: #111827;
}

.metric-cell span {
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-weight: 600;
  font-family: 'Courier New', monospace;
}

.metric-cell .critical {
  background: #fee2e2;
  color: #991b1b;
}

.metric-cell .warning {
  background: #ffedd5;
  color: #9a3412;
}

.metric-cell .normal {
  background: #f3f4f6;
  color: #374151;
}

.time-cell {
  font-family: monospace;
  color: #6b7280;
  font-size: 0.875rem;
}
</style>