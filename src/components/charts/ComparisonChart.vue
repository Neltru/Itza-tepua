<template>
  <div class="chart-wrapper" ref="chartBox">
    <div class="chart-header">
      <h3 class="chart-title">📊 Comparativa de Sensores</h3>
      <div class="chart-controls">
        <button 
          v-for="type in chartTypes" 
          :key="type.value"
          @click="selectedType = type.value"
          :class="['chart-type-btn', { active: selectedType === type.value }]"
        >
          {{ type.label }}
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando datos...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="error-state">
      <p>⚠️ Error al cargar datos: {{ error }}</p>
      <button @click="reload" class="retry-btn">Reintentar</button>
    </div>

    <!-- Empty -->
    <div v-else-if="!hasData" class="error-state">
      <p>Sin lecturas para comparar.</p>
      <button @click="reload" class="retry-btn">Actualizar</button>
    </div>

    <!-- Chart -->
    <div v-else class="chart-container">
      <canvas :key="canvasKey" ref="chartCanvas"></canvas>
    </div>

    <!-- Umbrales de Riesgo (dinámicos) -->
    <div v-if="hasAnyThreshold" class="thresholds">
      <h4>Umbrales de Riesgo <small v-if="thresholds.source==='fallback'">(referenciales)</small></h4>
      <div class="threshold-list">
        <div class="threshold-item">
          <span class="threshold-dot" style="background: #3b82f6"></span>
          <span class="threshold-label">Humedad crítica:</span>
          <span class="threshold-value">
            <template v-if="thresholds.humedad_max != null">&gt; {{ thresholds.humedad_max.toFixed(0) }}%</template>
            <template v-else>—</template>
          </span>
        </div>
        <div class="threshold-item">
          <span class="threshold-dot" style="background: #8b5cf6"></span>
          <span class="threshold-label">Inclinación crítica:</span>
          <span class="threshold-value">
            <template v-if="thresholds.angulo_max != null">&gt; {{ thresholds.angulo_max.toFixed(1) }}°</template>
            <template v-else>—</template>
          </span>
        </div>
        <div class="threshold-item">
          <span class="threshold-dot" style="background: #22c55e"></span>
          <span class="threshold-label">Aceleración crítica:</span>
          <span class="threshold-value">
            <template v-if="thresholds.aceleracion_max != null">&gt; {{ thresholds.aceleracion_max.toFixed(2) }} g</template>
            <template v-else>—</template>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed, nextTick } from 'vue'
import { useComparisonData } from '@/composables/useComparasionData'
import {
  Chart,
  BarController,
  LineController,
  RadarController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

Chart.register(
  BarController,
  LineController,
  RadarController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
)

const { comparisonData, thresholds, isLoading, error, reload } = useComparisonData()

const chartCanvas = ref(null)
const chartBox = ref(null)
const selectedType = ref('bar')
let chartInstance = null
let ro = null

const chartTypes = [
  { value: 'bar',  label: 'Barras' },
  { value: 'line', label: 'Líneas' },
  // { value: 'radar', label: 'Radar' }
]

// Para remount limpio del canvas en cambios
const canvasKey = computed(() => `${selectedType.value}-${comparisonData.value.length}`)

const getZoneLabel = (zoneName='') => {
  const match = zoneName.match?.(/Zona \w+/)
  return match ? match[0] : (zoneName || 'Zona').substring(0, 22)
}

const hasData = computed(() => {
  return Array.isArray(comparisonData.value) && comparisonData.value.some(s =>
    Number.isFinite(Number(s.humidity)) ||
    Number.isFinite(Number(s.inclination)) ||
    Number.isFinite(Number(s.vibration))
  )
})

const hasAnyThreshold = computed(() =>
  thresholds.value &&
  (thresholds.value.humedad_max != null ||
   thresholds.value.angulo_max  != null ||
   thresholds.value.aceleracion_max != null)
)

// === DATA (sin escalado, unidades reales) ===
const H = (x) => Number.isFinite(Number(x)) ? Number(x) : null            // %
const A = (x) => Number.isFinite(Number(x)) ? Number(x) : null            // ° (grados)
const G = (x) => Number.isFinite(Number(x)) ? Number(x) : null            // g (aceleración)

// === DATA normalizada a % (solo para radar) ===
function normalize(val, thr) {
  if (!Number.isFinite(Number(val)) || !Number.isFinite(Number(thr)) || thr <= 0) return null
  return Math.min(100, (Number(val) / Number(thr)) * 100)
}

function buildDatasets(labels) {
  const list = comparisonData.value

  // Radar: normalizamos a % respecto a umbrales para que tenga sentido comparativo
  if (selectedType.value === 'radar') {
    const hm = thresholds.value.humedad_max ?? 100
    const am = thresholds.value.angulo_max  ?? 30
    const gm = thresholds.value.aceleracion_max ?? 1

    return [{
      label: 'Humedad (% del umbral)',
      data: list.map(s => normalize(H(s.humidity), hm))
    },{
      label: 'Inclinación (% del umbral)',
      data: list.map(s => normalize(A(s.inclination), am))
    },{
      label: 'Aceleración (% del umbral)',
      data: list.map(s => normalize(G(s.vibration), gm))
    }].map((d, i) => ({
      ...d,
      borderColor: ['#3b82f6','#8b5cf6','#22c55e'][i],
      backgroundColor: ['#3b82f6','#8b5cf6','#22c55e'][i] + '33',
      borderWidth: 2,
      fill: true,
      pointRadius: 2
    }))
  }

  // Barras/Líneas: unidades reales + overlays de umbral por eje
  const humidity = {
    label: 'Humedad (%)',
    yAxisID: 'yH',
    data: list.map(s => H(s.humidity)),
    backgroundColor: 'rgba(59,130,246,0.5)',
    borderColor: '#3b82f6',
    borderWidth: 2,
    tension: 0.35
  }
  const inclination = {
    label: 'Inclinación (°)',
    yAxisID: 'yA',
    data: list.map(s => A(s.inclination)),
    backgroundColor: 'rgba(139,92,246,0.5)',
    borderColor: '#8b5cf6',
    borderWidth: 2,
    tension: 0.35
  }
  const vibration = {
    label: 'Aceleración (g)',
    yAxisID: 'yG',
    data: list.map(s => G(s.vibration)),
    backgroundColor: 'rgba(34,197,94,0.5)',
    borderColor: '#22c55e',
    borderWidth: 2,
    tension: 0.35
  }

  const ds = [humidity, inclination, vibration]

  // Overlays de umbrales (líneas punteadas) por eje
  const thr = thresholds.value || {}
  const thrDs = []

  if (thr.humedad_max != null) {
    thrDs.push({
      type: 'line',
      label: 'Umbral Humedad',
      yAxisID: 'yH',
      data: labels.map(() => Number(thr.humedad_max)),
      borderColor: '#3b82f6',
      pointRadius: 0,
      borderDash: [6, 4],
      borderWidth: 2,
      fill: false
    })
  }
  if (thr.angulo_max != null) {
    thrDs.push({
      type: 'line',
      label: 'Umbral Inclinación',
      yAxisID: 'yA',
      data: labels.map(() => Number(thr.angulo_max)),
      borderColor: '#8b5cf6',
      pointRadius: 0,
      borderDash: [6, 4],
      borderWidth: 2,
      fill: false
    })
  }
  if (thr.aceleracion_max != null) {
    thrDs.push({
      type: 'line',
      label: 'Umbral Aceleración',
      yAxisID: 'yG',
      data: labels.map(() => Number(thr.aceleracion_max)),
      borderColor: '#22c55e',
      pointRadius: 0,
      borderDash: [6, 4],
      borderWidth: 2,
      fill: false
    })
  }

  return [...ds, ...thrDs]
}

function buildScales() {
  // máximos dinámicos para ver bien los valores pequeños (p. ej. 0.05 g)
  const valsH = comparisonData.value.map(s => H(s.humidity)).filter(v => v != null)
  const valsA = comparisonData.value.map(s => A(s.inclination)).filter(v => v != null)
  const valsG = comparisonData.value.map(s => G(s.vibration)).filter(v => v != null)

  const t = thresholds.value || {}
  const maxH = Math.max( ...valsH, t.humedad_max ?? 0, 10 )
  const maxA = Math.max( ...valsA, t.angulo_max  ?? 0, 10 )
  const maxG = Math.max( ...valsG, t.aceleracion_max ?? 0, 0.1 )

  return {
    yH: {
      type:'linear', position:'left', beginAtZero:true, suggestedMax: maxH * 1.15,
      ticks: { callback: v => `${v}%`, precision: 1 }
    },
    yA: {
      type:'linear', position:'right', beginAtZero:true, suggestedMax: maxA * 1.15,
      grid: { drawOnChartArea: false },
      ticks: { callback: v => `${v}°`, precision: 1 }
    },
    yG: {
      type:'linear', position:'right', beginAtZero:true, suggestedMax: maxG * 1.15,
      grid: { drawOnChartArea: false },
      ticks: { callback: v => `${Number(v).toFixed(2)} g` }
    },
    x: {
      grid: { display: false },
      ticks: { font: { size: 11 } }
    }
  }
}

async function createChart() {
  await nextTick()
  await new Promise(r => requestAnimationFrame(r))

  const canvas = chartCanvas.value
  if (!canvas || !hasData.value) {
    if (chartInstance) { chartInstance.destroy(); chartInstance = null }
    return
  }

  const ctx = canvas.getContext('2d')
  const labels = comparisonData.value.map(s => getZoneLabel(s.zone))
  const datasets = buildDatasets(labels)

  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }

  const isRadar = selectedType.value === 'radar'
  chartInstance = new Chart(ctx, {
    type: selectedType.value,
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      aspectRatio: 2,
      plugins: {
        legend: {
          position: 'top',
          labels: { usePointStyle: true, padding: 15, font: { size: 12 } }
        },
        tooltip: {
          backgroundColor: 'rgba(17,24,39,0.95)',
          padding: 12,
          titleFont: { size: 13, weight: '600' },
          bodyFont: { size: 12 },
          cornerRadius: 8,
          displayColors: true,
          callbacks: {
            label: (context) => {
              const lbl = context.dataset.label || ''
              const y = context.parsed?.y
              if (/Humedad/.test(lbl)) {
                return `${lbl}: ${Number.isFinite(y) ? y.toFixed(1) : '—'}%`
              } else if (/Inclinación/.test(lbl)) {
                return `${lbl}: ${Number.isFinite(y) ? y.toFixed(1) : '—'}°`
              } else if (/Aceleración/.test(lbl)) {
                return `${lbl}: ${Number.isFinite(y) ? y.toFixed(2) : '—'} g`
              } else if (/Umbral/.test(lbl)) {
                // Mostrar el valor real del umbral (ya en sus unidades)
                if (lbl.includes('Humedad'))   return `${lbl}: ${thresholds.value.humedad_max?.toFixed(0) ?? '—'}%`
                if (lbl.includes('Inclinación')) return `${lbl}: ${thresholds.value.angulo_max?.toFixed(1) ?? '—'}°`
                if (lbl.includes('Aceleración')) return `${lbl}: ${thresholds.value.aceleracion_max?.toFixed(2) ?? '—'} g`
              }
              return lbl
            }
          }
        }
      },
      // Radar: un solo eje radial normalizado (0–100). Barras/Líneas: ejes múltiples reales
      scales: isRadar ? {
        r: {
          beginAtZero: true,
          suggestedMax: 100,
          ticks: { stepSize: 20, font: { size: 11 } },
          grid: { color: 'rgba(0,0,0,0.1)' }
        }
      } : buildScales(),
      interaction: { mode: 'index', intersect: false },
      animation: { duration: 450, easing: 'easeInOutQuad' }
    }
  })

  setTimeout(() => chartInstance?.resize(), 0)
}

// Render confiable: cuando termina la carga y hay datos
watch([isLoading, comparisonData], async ([loading]) => {
  if (!loading && hasData.value) await createChart()
}, { flush: 'post', deep: true })

// Al cambiar tipo de gráfico, redibujar
watch(() => selectedType.value, async () => {
  if (!isLoading.value && hasData.value) await createChart()
}, { flush: 'post' })

onMounted(async () => {
  if (!isLoading.value && hasData.value) await createChart()
  if (chartBox.value) {
    ro = new ResizeObserver(() => chartInstance?.resize())
    ro?.observe(chartBox.value)
  }
})

onUnmounted(() => {
  if (chartInstance) chartInstance.destroy()
  ro?.disconnect?.()
})
</script>

<style scoped>
.loading-state, .error-state {
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  padding:3rem 1rem; color:#6b7280;
}
.spinner { width:40px; height:40px; border:4px solid #f3f4f6; border-top-color:#3b82f6; border-radius:50%; animation:spin 1s linear infinite; margin-bottom:1rem; }
@keyframes spin { to { transform: rotate(360deg); } }
.error-state p { margin-bottom:1rem; color:#dc2626; }
.retry-btn { padding:.5rem 1rem; background:#3b82f6; color:#fff; border:none; border-radius:.5rem; cursor:pointer; font-size:.875rem; font-weight:500; transition:.2s; }
.retry-btn:hover { background:#2563eb; }

.chart-wrapper { background:#fff; border-radius:.75rem; padding:1.5rem; box-shadow:0 1px 3px rgba(0,0,0,.1); border:1px solid #e5e7eb; }
.chart-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; gap:1rem; flex-wrap:wrap; }
.chart-title { margin:0; font-size:1.125rem; font-weight:600; color:#111827; }

.chart-controls { display:flex; gap:.5rem; background:#f3f4f6; padding:.25rem; border-radius:.5rem; }
.chart-type-btn { padding:.5rem 1rem; border:none; background:transparent; border-radius:.375rem; font-size:.875rem; font-weight:500; color:#6b7280; cursor:pointer; transition:.2s; }
.chart-type-btn:hover { color:#111827; }
.chart-type-btn.active { background:#fff; color:#111827; box-shadow:0 1px 3px rgba(0,0,0,.1); }

.chart-container { position:relative; height:400px; width:100%; }

.thresholds { margin-top:1.5rem; padding:1rem; background:#f9fafb; border-radius:.5rem; }
.thresholds h4 { margin:0 0 .75rem 0; font-size:.875rem; font-weight:600; color:#374151; text-transform:uppercase; letter-spacing:.05em; }
.threshold-list { display:flex; gap:2rem; flex-wrap:wrap; }
.threshold-item { display:flex; align-items:center; gap:.5rem; font-size:.875rem; }
.threshold-dot { width:.75rem; height:.75rem; border-radius:50%; flex-shrink:0; }
.threshold-label { color:#6b7280; }
.threshold-value { font-weight:600; color:#dc2626; }

@media (max-width: 640px) {
  .chart-header { flex-direction:column; align-items:flex-start; }
  .chart-controls { width:100%; }
  .chart-type-btn { flex:1; }
  .threshold-list { flex-direction:column; gap:.75rem; }
}
</style>
