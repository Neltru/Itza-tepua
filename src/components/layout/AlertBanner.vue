<template>
  <!-- Overlay backdrop -->
  <Transition name="fade">
    <div v-if="alert" class="alert-overlay" @click="handleBackdropClick">
      <Transition name="slide">
        <div class="alert-card" @click.stop>
          <!-- Animated background decoration -->
          <div class="card-decoration"></div>
          
          <!-- Close button -->
          <button @click="$emit('dismiss')" class="close-btn" title="Cerrar alerta">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M18 6L6 18M6 6l12 12" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>

          <!-- Alert Icon -->
          <div class="alert-icon-container">
            <div class="icon-pulse"></div>
            <div class="alert-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M12 9v4m0 4h.01" stroke="white" stroke-width="2" stroke-linecap="round"/>
                <path d="M12 3l9 18H3L12 3z" stroke="white" stroke-width="2" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>

          <!-- Card Header -->
          <div class="card-header">
            <div class="status-badge">
              <span class="status-dot"></span>
              {{ severityLabel }}
            </div>

            <div class="alert-time">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" stroke-width="2"/>
                <path d="M12 6v6l4 2" stroke-width="2" stroke-linecap="round"/>
              </svg>
              {{ getCurrentTime() }}
            </div>
          </div>

          <!-- Card Body -->
          <div class="card-body">
            <h3 class="alert-title">{{ titleLabel }}</h3>
            <p class="alert-description">
              Se ha detectado una zona con condiciones críticas que requiere 
              <strong>evacuación inmediata</strong>.
            </p>
            
            <div class="location-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke-width="2"/>
                <circle cx="12" cy="10" r="3" stroke-width="2"/>
              </svg>
              <div>
                <span class="location-label">Ubicación</span>
                <span class="location-value">{{ alert.zone }}</span>
              </div>
            </div>
          </div>

          <!-- Metrics Grid -->
          <div class="metrics-section">
            <h4 class="metrics-title">Lecturas de Sensores</h4>

            <div class="metrics-grid">
              <!-- Humedad -->
              <div class="metric-card" :class="getMetricSeverity('humidity', alert.humidity)">
                <div class="metric-header">
                  <span class="metric-icon">💧</span>
                  <span class="metric-name">Humedad</span>
                </div>
                <div class="metric-value">
                  {{ alert.humidity != null ? alert.humidity.toFixed(1) : '—' }}<span class="unit">%</span>
                </div>
                <div class="metric-bar">
                  <div class="bar-fill" :style="{ width: barWidth('humidity', alert.humidity) }"></div>
                </div>
              </div>

              <!-- Inclinación -->
              <div class="metric-card" :class="getMetricSeverity('inclination', alert.inclination)">
                <div class="metric-header">
                  <span class="metric-icon">📐</span>
                  <span class="metric-name">Inclinación</span>
                </div>
                <div class="metric-value">
                  {{ alert.inclination != null ? alert.inclination.toFixed(1) : '—' }}<span class="unit">°</span>
                </div>
                <div class="metric-bar">
                  <div class="bar-fill" :style="{ width: barWidth('inclination', alert.inclination) }"></div>
                </div>
              </div>

              <!-- Vibración (en g) -->
              <div class="metric-card" :class="getMetricSeverity('vibration', alert.vibration)">
                <div class="metric-header">
                  <span class="metric-icon">📳</span>
                  <span class="metric-name">Aceleración</span>
                </div>
                <div class="metric-value">
                  {{ alert.vibration != null ? Number(alert.vibration).toFixed(2) : '—' }}<span class="unit"> g</span>
                </div>
                <div class="metric-bar">
                  <div class="bar-fill" :style="{ width: barWidth('vibration', alert.vibration) }"></div>
                </div>
              </div>
            </div>
          </div>


          <!-- Action Buttons -->
          <div class="card-actions">
            <button class="action-btn primary" @click="handleEmergency">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke-width="2"/>
                <path d="M12 9v4m0 4h.01" stroke-width="2" stroke-linecap="round"/>
              </svg>
              Protocolo de Emergencia
            </button>
            <button class="action-btn secondary" @click="$emit('dismiss')">
              Entendido
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'
import { SENSOR_THRESHOLDS } from '@/utils/constants'

const props = defineProps({
  // Espera algo como:
  // {
  //   zone: 'Cerro de la Cruz',
  //   humidity: 83.2,           // %
  //   inclination: 27.4,        // °
  //   vibration: 0.12,          // g
  //   thresholds: {             // opcional por zona
  //     humedad_max: 82,
  //     angulo_max: 25,
  //     aceleracion_max: 0.40
  //   },
  //   level: 'CRITICAL'         // opcional
  // }
  alert: { type: Object, required: true }
})

const emit = defineEmits(['dismiss'])

// Hora local breve
const getCurrentTime = () =>
  new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

// --- Umbrales efectivos (por zona si vienen; si no, fallback global) ---
const thr = computed(() => {
  const z = props.alert?.thresholds || {}
  return {
    humedad_max:     z.humedad_max     ?? SENSOR_THRESHOLDS.humidity.critical,
    angulo_max:      z.angulo_max      ?? SENSOR_THRESHOLDS.inclination.critical,
    aceleracion_max: z.aceleracion_max ?? SENSOR_THRESHOLDS.vibration.critical
  }
})

// Severidad por métrica contra umbral real
const metricSeverity = (type, value) => {
  const t = thr.value
  if (value == null) return 'normal'
  if (type === 'humidity')    return value >= t.humedad_max     ? 'critical' : (value >= t.humedad_max * 0.75 ? 'warning' : 'normal')
  if (type === 'inclination') return value >= t.angulo_max      ? 'critical' : (value >= t.angulo_max * 0.60 ? 'warning' : 'normal')
  if (type === 'vibration')   return value >= t.aceleracion_max ? 'critical' : (value >= t.aceleracion_max * 0.60 ? 'warning' : 'normal')
  return 'normal'
}

// Overall
const overallLevel = computed(() => {
  if (props.alert?.level) return props.alert.level // si te llega del back, respétalo
  const sev = [
    metricSeverity('humidity', props.alert.humidity),
    metricSeverity('inclination', props.alert.inclination),
    metricSeverity('vibration', props.alert.vibration)
  ]
  if (sev.includes('critical')) return 'CRITICAL'
  if (sev.includes('warning'))  return 'HIGH'
  return 'LOW'
})

// Etiquetas
const severityLabel = computed(() => ({
  CRITICAL: 'ALERTA CRÍTICA',
  HIGH:     'ALERTA ALTA',
  MEDIUM:   'ALERTA MEDIA',
  LOW:      'ALERTA BAJA'
})[overallLevel.value] || 'ALERTA')

const titleLabel = computed(() => ({
  CRITICAL: '⚠️ Riesgo Crítico de Derrumbe',
  HIGH:     '⚠️ Riesgo Alto de Derrumbe',
  MEDIUM:   '⚠️ Riesgo Medio de Derrumbe',
  LOW:      '⚠️ Riesgo Bajo de Derrumbe'
})[overallLevel.value] || '⚠️ Alerta de Derrumbe')

// Barra: % relativo al umbral crítico (cap 130% para no desbordar)
const clamp = (n, min, max) => Math.max(min, Math.min(max, n))
const barWidth = (type, val) => {
  if (val == null) return '0%'
  const t = thr.value
  const denom =
    type === 'humidity'    ? (t.humedad_max || 100) :
    type === 'inclination' ? (t.angulo_max || 25) :
    type === 'vibration'   ? (t.aceleracion_max || 0.40) : 1
  const pct = denom > 0 ? (val / denom) * 100 : 0
  return `${clamp(pct, 0, 130)}%`
}

// Clases por métrica (para colorear tarjetas)
const getMetricSeverity = (type, value) => metricSeverity(type, value)

// Botones
const handleBackdropClick = () => { /* si quieres cerrar al clicar fuera: emit('dismiss') */ }
const handleEmergency = () => {
  console.log('Activando protocolo de emergencia')
  // Aquí disparas acción real si aplica
}
</script>


<style scoped>
/* Overlay */
.alert-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 9999;
}

/* Card */
.alert-card {
  position: relative;
  max-width: 600px;
  width: 100%;
  background: white;
  border-radius: 1rem;
  box-shadow: 
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04),
    0 0 0 1px rgba(220, 38, 38, 0.1);
  overflow: hidden;
  max-height: 90vh;
  overflow-y: auto;
}

/* Decorative background */
.card-decoration {
  position: absolute;
  top: 0;
  right: 0;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(220, 38, 38, 0.1) 0%, transparent 70%);
  border-radius: 50%;
  transform: translate(50%, -50%);
  pointer-events: none;
}

/* Close button */
.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border: none;
  border-radius: 0.5rem;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 10;
}

.close-btn:hover {
  background: #e5e7eb;
  color: #111827;
  transform: scale(1.1);
}

/* Alert Icon */
.alert-icon-container {
  position: relative;
  display: flex;
  justify-content: center;
  padding: 2rem 0 1rem;
}

.icon-pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  background: rgba(220, 38, 38, 0.2);
  border-radius: 50%;
  animation: pulse-ring 2s ease-out infinite;
}

@keyframes pulse-ring {
  0% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.4);
    opacity: 0;
  }
}

.alert-icon {
  position: relative;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
  animation: shake 0.6s ease-in-out infinite;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-3px); }
  75% { transform: translateX(3px); }
}

/* Card Header */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem 1rem;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 9999px;
  color: #991b1b;
  font-size: 0.8125rem;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: #dc2626;
  border-radius: 50%;
  animation: blink 1.5s ease-in-out infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.alert-time {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
  font-family: monospace;
}

/* Card Body */
.card-body {
  padding: 0 2rem 1.5rem;
}

.alert-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  line-height: 1.3;
}

.alert-description {
  margin: 0 0 1.5rem 0;
  font-size: 0.9375rem;
  color: #6b7280;
  line-height: 1.6;
}

.alert-description strong {
  color: #dc2626;
  font-weight: 600;
}

.location-box {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border: 1px solid #fecaca;
  border-radius: 0.75rem;
}

.location-box svg {
  flex-shrink: 0;
  color: #dc2626;
}

.location-box > div {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.location-label {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.location-value {
  font-size: 1rem;
  color: #991b1b;
  font-weight: 600;
}

/* Metrics Section */
.metrics-section {
  padding: 1.5rem 2rem;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
}

.metrics-title {
  margin: 0 0 1rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.metric-card {
  padding: 1rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  transition: all 0.2s;
}

.metric-card.critical {
  border-color: #fecaca;
  background: #fef2f2;
}

.metric-card.warning {
  border-color: #fed7aa;
  background: #fff7ed;
}

.metric-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.metric-icon {
  font-size: 1.25rem;
}

.metric-name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #6b7280;
}

.metric-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
  font-family: monospace;
}

.metric-card.critical .metric-value {
  color: #dc2626;
}

.metric-card.warning .metric-value {
  color: #ea580c;
}

.unit {
  font-size: 1rem;
  color: #6b7280;
  font-weight: 500;
  margin-left: 0.25rem;
}

.metric-bar {
  height: 4px;
  background: #e5e7eb;
  border-radius: 9999px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 9999px;
  transition: width 0.5s ease;
}

.metric-card.critical .bar-fill {
  background: linear-gradient(90deg, #dc2626 0%, #991b1b 100%);
}

.metric-card.warning .bar-fill {
  background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
}

/* Action Buttons */
.card-actions {
  display: flex;
  gap: 0.75rem;
  padding: 1.5rem 2rem;
}

.action-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn.primary {
  background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
  color: white;
  box-shadow: 0 4px 6px rgba(220, 38, 38, 0.2);
}

.action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(220, 38, 38, 0.3);
}

.action-btn.secondary {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.action-btn.secondary:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  transform: scale(0.9) translateY(-20px);
  opacity: 0;
}

.slide-leave-to {
  transform: scale(0.95);
  opacity: 0;
}

/* Responsive */
@media (max-width: 640px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .card-actions {
    flex-direction: column;
  }

  .alert-card {
    margin: 0.5rem;
  }
}
</style>