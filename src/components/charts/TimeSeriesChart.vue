<template>
  <div class="chart-wrapper">
    <div class="chart-header">
      <h3 class="chart-title">📈 Histórico (Últimas 24h)</h3>
      <select v-model="selectedMetric" class="metric-select">
        <option value="humidity">Humedad</option>
        <option value="inclination">Inclinación</option>
        <option value="vibration">Vibración</option>
      </select>
    </div>
    <div class="chart-container">
      <canvas ref="chartCanvas"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
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

const props = defineProps({
  sensors: Array
})

const chartCanvas = ref(null)
const selectedMetric = ref('humidity')
let chartInstance = null

const colors = [
  '#3b82f6', '#ef4444', '#10b981', 
  '#f59e0b', '#8b5cf6', '#ec4899'
]

const getZoneLabel = (zoneName) => {
  const match = zoneName.match(/Zona \w+/)
  return match ? match[0] : zoneName.substring(0, 10)
}

const generateHistoricalData = (sensor) => {
  return Array.from({ length: 24 }, (_, i) => {
    const variance = (Math.random() - 0.5) * 10
    return {
      humidity: Math.max(0, Math.min(100, sensor.humidity + variance)),
      inclination: Math.max(0, sensor.inclination + (Math.random() - 0.5) * 2),
      vibration: Math.max(0, Math.floor(sensor.vibration + (Math.random() - 0.5) * 10))
    }
  })
}

const createChart = () => {
  if (!chartCanvas.value) return

  if (chartInstance) {
    chartInstance.destroy()
  }

  const ctx = chartCanvas.value.getContext('2d')
  const labels = Array.from({ length: 24 }, (_, i) => `${i}:00`)

  const datasets = props.sensors.map((sensor, idx) => {
    const historicalData = generateHistoricalData(sensor)
    return {
      label: getZoneLabel(sensor.zone),
      data: historicalData.map(d => d[selectedMetric.value]),
      borderColor: colors[idx],
      backgroundColor: colors[idx] + '20',
      borderWidth: 2,
      tension: 0.4,
      fill: true,
      pointRadius: 3,
      pointHoverRadius: 5,
      pointBackgroundColor: colors[idx],
      pointBorderColor: '#fff',
      pointBorderWidth: 2
    }
  })

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

watch(() => selectedMetric.value, () => {
  createChart()
})

watch(() => props.sensors, () => {
  if (chartInstance) {
    createChart()
  }
}, { deep: true })

onMounted(() => {
  createChart()
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy()
  }
})
</script>

<style scoped>
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