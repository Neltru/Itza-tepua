<template>
  <div class="chart-wrapper" ref="chartBox">
    <div class="chart-header">
      <h3 class="chart-title">📈 Histórico ({{ titleScopeLabel }})</h3>
      <div class="controls">
        <select v-model="selectedScope" class="select" :disabled="isLoading">
          <option value="today">Hoy</option>
          <option value="week">Últimos 7 días</option>
          <option value="month">Últimos 30 días</option>
        </select>
        <select v-model="selectedMetric" class="select" :disabled="isLoading">
          <option value="humidity">Humedad</option>
          <option value="inclination">Inclinación</option>
          <option value="vibration">Vibración</option>
        </select>
      </div>
    </div>

    <div v-if="isLoading" class="state"><div class="spinner"></div><p>Cargando histórico…</p></div>
    <div v-else-if="error" class="state error"><p>⚠️ {{ error }}</p><button @click="onReload" class="btn">Reintentar</button></div>
    <div v-else-if="!hasData" class="state"><p>Sin lecturas en el rango seleccionado.</p><button @click="onReload" class="btn">Actualizar</button></div>

    <div v-else class="chart-container">
      <!-- Forzar remount del canvas al cambiar filtros -->
      <canvas :key="canvasKey" ref="chartCanvas"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed, nextTick } from 'vue'
import { useHistoricalData } from '@/composables/useHistoricalData'
import {
  Chart, LineController, CategoryScale, LinearScale,
  PointElement, LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js'

Chart.register(LineController, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

// Por defecto: semana
const { historicalData, selectedMetric, selectedScope, zoneId, isLoading, error, loadHistory } =
  useHistoricalData({ metric: 'humidity', scope: 'week', zoneId: 1 })

const chartCanvas = ref(null)
const chartBox = ref(null)
let chartInstance = null
let ro = null
const redrawSeed = ref(0)
const canvasKey = computed(() => `${selectedScope.value}-${selectedMetric.value}-${zoneId.value}-${redrawSeed.value}`)

const colors = ['#3b82f6','#ef4444','#10b981','#f59e0b','#8b5cf6','#ec4899']
const units  = { humidity: '%', inclination: '°', vibration: ' g' }

const titleScopeLabel = computed(() => ({ today:'Hoy', week:'Últimos 7 días', month:'Últimos 30 días' }[selectedScope.value]))

const hasData = computed(() => {
  const serie = historicalData.value?.[0]?.data ?? []
  return serie.length > 0 && serie.some(p => Number.isFinite(Number(p.value)))
})

const fmtLabel = (iso) => {
  const d = new Date(iso)
  if (selectedScope.value === 'today') {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) // HH:MM
  } else {
    return d.toLocaleDateString([], { day: '2-digit', month: '2-digit' })   // DD/MM
  }
}

function buildData() {
  const serie = historicalData.value?.[0] ?? { data: [], zone: '' }
  const labels = serie.data.map(p => fmtLabel(p.time))
  const values = serie.data.map(p => {
    const n = Number(p.value); return Number.isFinite(n) ? n : null
  })

  return {
    labels,
    datasets: [{
      label: serie.zone || 'Zona',
      data: values,
      borderColor: colors[0],
      backgroundColor: colors[0] + '20',
      borderWidth: 2,
      tension: 0.35,
      fill: true,
      pointRadius: 2,
      pointHoverRadius: 5,
      pointBackgroundColor: colors[0],
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      spanGaps: true
    }]
  }
}

async function renderChart() {
  await nextTick()
  await new Promise(r => requestAnimationFrame(r))

  const canvas = chartCanvas.value
  if (!canvas || !hasData.value) {
    if (chartInstance) { chartInstance.destroy(); chartInstance = null }
    return
  }

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const { labels, datasets } = buildData()

  if (!chartInstance) {
    chartInstance = new Chart(ctx, {
      type: 'line',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { usePointStyle: true, padding: 15, font: { size: 12 } } },
          tooltip: {
            backgroundColor: 'rgba(17,24,39,0.95)',
            padding: 12,
            titleFont: { size: 13, weight: '600' },
            bodyFont: { size: 12 },
            cornerRadius: 8,
            callbacks: {
              label: (ctx) => {
                const y = ctx.parsed?.y
                const val = (typeof y === 'number' && !Number.isNaN(y)) ? y.toFixed(2) : '—'
                return `${ctx.dataset.label}: ${val}${units[selectedMetric.value]}`
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0,0,0,0.05)' },
            ticks: { font: { size: 11 }, callback: v => `${v}${units[selectedMetric.value]}` }
          },
          x: {
            grid: { display: false },
            ticks: { maxTicksLimit: selectedScope.value === 'today' ? 12 : 10, font: { size: 11 } }
          }
        },
        interaction: { mode: 'index', intersect: false },
        animation: false
      }
    })
  } else {
    chartInstance.data.labels = labels
    chartInstance.data.datasets = datasets
    chartInstance.update('none')
  }
  setTimeout(() => chartInstance?.resize(), 0)
}

function destroyChart() {
  if (chartInstance) { chartInstance.destroy(); chartInstance = null }
}

async function refreshAll() {
  destroyChart()
  // fuerza remount del canvas para limpiar contextos colgados
  redrawSeed.value++
  await loadHistory()
  await renderChart()
}

function onReload() { refreshAll() }

// Cambios de filtros: control explícito del flujo
watch([selectedScope, selectedMetric, zoneId], async () => {
  await refreshAll()
})

onMounted(async () => {
  await refreshAll()
  if (chartBox.value) {
    ro = new ResizeObserver(() => chartInstance?.resize())
    ro.observe(chartBox.value)
  }
})

onUnmounted(() => {
  destroyChart()
  if (ro) ro.disconnect()
})
</script>

<style scoped>
.chart-wrapper { background:#fff; border-radius:.75rem; padding:1.5rem; box-shadow:0 1px 3px rgba(0,0,0,.1); border:1px solid #e5e7eb; }
.chart-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; }
.chart-title { margin:0; font-size:1.125rem; font-weight:600; color:#111827; }
.controls { display:flex; gap:.5rem; }
.select { padding:.5rem 1rem; border:1px solid #d1d5db; border-radius:.5rem; font-size:.875rem; background:white; cursor:pointer; }

.chart-container { position:relative; height:300px; width:100%; }

.state { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:3rem 1rem; color:#6b7280; }
.state.error p { color:#dc2626; }
.btn { padding:.5rem 1rem; background:#3b82f6; color:#fff; border:none; border-radius:.5rem; cursor:pointer; font-size:.875rem; font-weight:500; }
.btn:hover { background:#2563eb; }

.spinner{ width:40px; height:40px; border:4px solid #f3f4f6; border-top-color:#3b82f6; border-radius:50%; animation:spin 1s linear infinite; margin-bottom:1rem; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
