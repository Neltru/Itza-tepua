<template>
  <div class="chart-wrapper">
    <div class="chart-header">
      <h3 class="chart-title">📈 Histórico (Últimas 24h)</h3>
      <select v-model="selectedMetric" class="metric-select" :disabled="isLoading">
        <option value="humidity">Humedad</option>
        <option value="inclination">Inclinación</option>
        <option value="vibration">Vibración</option>
      </select>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando histórico...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <p>⚠️ Error al cargar datos: {{ error }}</p>
      <button @click="reload" class="retry-btn">Reintentar</button>
    </div>

    <!-- Chart -->
    <div v-else class="chart-container">
      <canvas ref="chartCanvas"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useHistoricalData } from '@/composables/useHistoricalData'
import {
  Chart,
  LineController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

Chart.register(
  LineController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

// Usar el composable para obtener datos históricos
const { historicalData, selectedMetric, isLoading, error, reload } = useHistoricalData()

const chartCanvas = ref(null)
let chartInstance = null

const colors = [
  '#3b82f6', '#ef4444', '#10b981', 
  '#f59e0b', '#8b5cf6', '#ec4899'
]

const getZoneLabel = (zoneName) => {
  const match = zoneName.match(/Zona \w+/)
  return match ? match[0] : zoneName.substring(0, 10)
}

const createChart = () => {
  if (!chartCanvas.value || !historicalData.value.length) return

  if (chartInstance) {
    chartInstance.destroy()
  }

  const ctx = chartCanvas.value.getContext('2d')
  
  // Asumir que historicalData viene en formato:
  // [{ zone: "Zona Norte", data: [{time: "00:00", value: 50}, ...] }, ...]
  const labels = historicalData.value[0]?.data?.map(d => d.time) || []

  const datasets = historicalData.value.map((sensor, idx) => ({
    label: getZoneLabel(sensor.zone),
    data: sensor.data.map(d => d.value),
    borderColor: colors[idx % colors.length],
    backgroundColor: colors[idx % colors.length] + '20',
    borderWidth: 2,
    tension: 0.4,
    fill: true,
    pointRadius: 3,
    pointHoverRadius: 5,
    pointBackgroundColor: colors[idx % colors.length],
    pointBorderColor: '#fff',
    pointBorderWidth: 2
  }))

  const units = {
    humidity: '%',
    inclination: '°',
    vibration: ' Hz'
  }

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 2.5,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 15,
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(17, 24, 39, 0.95)',
          padding: 12,
          titleFont: {
            size: 13,
            weight: '600'
          },
          bodyFont: {
            size: 12
          },
          cornerRadius: 8,
          callbacks: {
            label: function(context) {
              return context.dataset.label + ': ' + 
                     context.parsed.y.toFixed(1) + 
                     units[selectedMetric.value]
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          },
          ticks: {
            font: {
              size: 11
            },
            callback: function(value) {
              return value + units[selectedMetric.value]
            }
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            maxTicksLimit: 12,
            font: {
              size: 11
            }
          }
        }
      },
      interaction: {
        mode: 'index',
        intersect: false
      }
    }
  })
}

watch(() => historicalData.value, () => {
  if (historicalData.value.length) {
    createChart()
  }
}, { deep: true })

onMounted(() => {
  if (historicalData.value.length) {
    createChart()
  }
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy()
  }
})
</script>

<style scoped>
/* ... estilos existentes ... */

.loading-state,
.error-state {
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

.metric-select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.chart-wrapper {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.chart-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.metric-select {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.metric-select:hover {
  border-color: #9ca3af;
}

.metric-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.chart-container {
  position: relative;
  height: 300px;
}
</style>