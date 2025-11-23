<template>
  <div class="sensor-table-wrapper">
    <h3 class="table-title">
      📊 Tabla de Estadísticas por Sensor
    </h3>
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>
              <span class="header-icon"></span>
              Zona
            </th>
            <th>
              <span class="header-icon"></span>
              Humedad
            </th>
            <th>
              <span class="header-icon"></span>
              Inclinación
            </th>
            <th>
              <span class="header-icon"></span>
              Vibración
            </th>
            <th>
              <span class="header-icon"></span>
              Riesgo
            </th>
            <th>
              <span class="header-icon"></span>
              Actualización
            </th>
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
  getRiskLevel: Function
})

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

.table-title {
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

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

.header-icon {
  margin-right: 0.5rem;
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