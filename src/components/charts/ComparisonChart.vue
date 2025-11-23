<template>
  <div class="chart-wrapper">
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

    <div class="chart-container">
      <canvas ref="chartCanvas"></canvas>
    </div>

    <!-- Umbrales de Riesgo -->
    <div class="thresholds">
      <h4>Umbrales de Riesgo:</h4>
      <div class="threshold-list">
        <div class="threshold-item">
          <span class="threshold-dot" style="background: #3b82f6"></span>
          <span class="threshold-label">Humedad crítica:</span>
          <span class="threshold-value">&gt; 80%</span>
        </div>
        <div class="threshold-item">
          <span class="threshold-dot" style="background: #8b5cf6"></span>
          <span class="threshold-label">Inclinación crítica:</span>
          <span class="threshold-value">&gt; 10°</span>
        </div>
        <div class="threshold-item">
          <span class="threshold-dot" style="background: #22c55e"></span>
          <span class="threshold-label">Vibración crítica:</span>
          <span class="threshold-value">&gt; 40 Hz</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
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

// Registrar componentes de Chart.js
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

const props = defineProps({
  sensors: Array
})

const chartCanvas = ref(null)
const selectedType = ref('bar')
let chartInstance = null

const chartTypes = [
  { value: 'bar', label: 'Barras' },
  { value: 'line', label: 'Líneas' },
  { value: 'radar', label: 'Radar' }
]

const getZoneLabel = (zoneName) => {
  const match = zoneName.match(/Zona \w+/)
  return match ? match[0] : zoneName.substring(0, 10)
}

const createChart = () => {
  if (!chartCanvas.value) return

  // Destruir gráfica anterior si existe
  if (chartInstance) {
    chartInstance.destroy()
  }

  const ctx = chartCanvas.value.getContext('2d')
  const labels = props.sensors.map(s => getZoneLabel(s.zone))

  const datasets = [
    {
      label: 'Humedad (%)',
      data: props.sensors.map(s => s.humidity),
      backgroundColor: 'rgba(59, 130, 246, 0.5)',
      borderColor: '#3b82f6',
      borderWidth: 2,
      tension: 0.4
    },
    {
      label: 'Inclinación (° × 10)',
      data: props.sensors.map(s => s.inclination * 10),
      backgroundColor: 'rgba(139, 92, 246, 0.5)',
      borderColor: '#8b5cf6',
      borderWidth: 2,
      tension: 0.4
    },
    {
      label: 'Vibración (Hz × 2)',
      data: props.sensors.map(s => s.vibration * 2),
      backgroundColor: 'rgba(34, 197, 94, 0.5)',
      borderColor: '#22c55e',
      borderWidth: 2,
      tension: 0.4
    }
  ]

  const config = {
    type: selectedType.value,
    data: {
      labels,
      datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 2,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 15,
            font: {
              size: 12,
              family: "'Inter', sans-serif"
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
          displayColors: true,
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || ''
              if (label) {
                label += ': '
              }
              // Ajustar valores escalados
              if (label.includes('Inclinación')) {
                label += (context.parsed.y / 10).toFixed(1) + '°'
              } else if (label.includes('Vibración')) {
                label += (context.parsed.y / 2).toFixed(0) + ' Hz'
              } else {
                label += context.parsed.y.toFixed(1) + '%'
              }
              return label
            }
          }
        }
      },
      scales: selectedType.value === 'radar' ? {
        r: {
          beginAtZero: true,
          max: 100,
          ticks: {
            stepSize: 20,
            font: {
              size: 11
            }
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        }
      } : {
        y: {
          beginAtZero: true,
          max: 100,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)',
            drawBorder: false
          },
          ticks: {
            font: {
              size: 11
            },
            callback: function(value) {
              return value
            }
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            font: {
              size: 11
            }
          }
        }
      },
      interaction: {
        mode: 'index',
        intersect: false
      },
      animation: {
        duration: 750,
        easing: 'easeInOutQuart'
      }
    }
  }

  chartInstance = new Chart(ctx, config)
}

watch(() => selectedType.value, () => {
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
  flex-wrap: wrap;
  gap: 1rem;
}

.chart-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.chart-controls {
  display: flex;
  gap: 0.5rem;
  background: #f3f4f6;
  padding: 0.25rem;
  border-radius: 0.5rem;
}

.chart-type-btn {
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.chart-type-btn:hover {
  color: #111827;
}

.chart-type-btn.active {
  background: white;
  color: #111827;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.chart-container {
  position: relative;
  height: 400px;
}

.thresholds {
  margin-top: 1.5rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
}

.thresholds h4 {
  margin: 0 0 0.75rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.threshold-list {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.threshold-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.threshold-dot {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.threshold-label {
  color: #6b7280;
}

.threshold-value {
  font-weight: 600;
  color: #dc2626;
}

@media (max-width: 640px) {
  .chart-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .chart-controls {
    width: 100%;
  }

  .chart-type-btn {
    flex: 1;
  }

  .threshold-list {
    flex-direction: column;
    gap: 0.75rem;
  }
}
</style>