<template>
  <div class="stat-card">
    <div class="stat-header">
      <span class="stat-icon" :style="{ background: iconColor }">{{ icon }}</span>
      <span class="stat-label">{{ label }}</span>
    </div>

    <div class="stat-value">
      <span v-if="isLoading" class="loading-text">--</span>
      <span v-else>{{ formattedValue }}</span>
    </div>

    <div class="stat-status" :class="statusClass">{{ currentStatus }}</div>

    <div v-if="showThresholdHint && hasThresholds" class="stat-hint">
      Umbral: <strong>{{ criticalFormatted }}</strong>
      <span v-if="threshold.warning">&nbsp;•&nbsp;Alerta: {{ warningFormatted }}</span>
    </div>
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
  isLoading: { type: Boolean, default: false },
  threshold: { type: Object, default: () => ({ warning: null, critical: null }) },
  precision: { type: Number, default: 1 },
  showThresholdHint: { type: Boolean, default: false }
})

const hasValue = computed(() => props.value !== null && props.value !== undefined && Number.isFinite(Number(props.value)))
const hasThresholds = computed(() => props.threshold && (props.threshold.critical != null || props.threshold.warning != null))

const format = (n, p) => Number(n).toFixed(p)

// Valor mostrado
const formattedValue = computed(() => {
  if (props.isLoading) return '--'
  if (!hasValue.value) return 'Sin datos'
  const fixed = format(props.value, props.precision)
  return props.unit ? `${fixed}${props.unit}` : fixed
})

// Umbral mostrado
const criticalFormatted = computed(() => {
  const c = props.threshold?.critical
  return c != null ? (props.unit ? `${format(c, props.precision)}${props.unit}` : format(c, props.precision)) : '—'
})
const warningFormatted = computed(() => {
  const w = props.threshold?.warning
  return w != null ? (props.unit ? `${format(w, props.precision)}${props.unit}` : format(w, props.precision)) : '—'
})

// Estado textual
const currentStatus = computed(() => {
  if (props.isLoading) return 'Cargando...'
  if (!hasValue.value) return 'Sin datos'
  if (props.status) return props.status

  const val = Number(props.value)
  const { warning, critical } = props.threshold || {}
  if (critical != null && val >= Number(critical)) return 'Crítico'
  if (warning  != null && val >= Number(warning))  return 'Alerta'
  return 'Normal'
})

const statusClass = computed(() => {
  const s = currentStatus.value.toLowerCase()
  if (s.includes('crítico')) return 'critical'
  if (s.includes('alerta'))  return 'warning'
  if (s.includes('cargando')) return 'loading'
  if (s.includes('sin datos')) return 'loading'
  return 'normal'
})
</script>

<style scoped>
.stat-card { background: #fff; padding: 1.5rem; border-radius: .75rem; box-shadow: 0 1px 3px rgba(0,0,0,.1); border: 1px solid #e5e7eb; transition: .3s; }
.stat-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,.1); transform: translateY(-2px); }

.stat-header { display:flex; align-items:center; gap:.75rem; margin-bottom:1rem; }
.stat-icon { width:2.5rem; height:2.5rem; border-radius:.5rem; display:flex; align-items:center; justify-content:center; font-size:1.25rem; }
.stat-label { font-size:.875rem; color:#6b7280; font-weight:500; }

.stat-value { font-size:2rem; font-weight:bold; color:#111827; margin-bottom:.5rem; font-family:'Courier New', monospace; }
.loading-text { color:#9ca3af; animation:pulse 1.5s ease-in-out infinite; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }

.stat-status { font-size:.875rem; font-weight:600; }
.stat-status.normal   { color:#22c55e; }
.stat-status.warning  { color:#f59e0b; }
.stat-status.critical { color:#dc2626; }
.stat-status.loading  { color:#9ca3af; }

.stat-hint { margin-top:.5rem; font-size:.75rem; color:#6b7280; }
.stat-hint strong { color:#111827; }
</style>
