import { ref, onMounted, watch } from 'vue'
import { fetchSensorHistory } from '@/utils/api'

export function useHistoricalData(metric = 'humidity') {
  const historicalData = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const selectedMetric = ref(metric)

  const loadHistory = async () => {
    isLoading.value = true
    error.value = null

    try {
      const data = await fetchSensorHistory(selectedMetric.value, '24h')
      historicalData.value = data
    } catch (err) {
      console.error('Error al cargar datos históricos:', err)
      error.value = err.message
      // Fallback a datos vacíos
      historicalData.value = []
    } finally {
      isLoading.value = false
    }
  }

  // Recargar cuando cambie la métrica seleccionada
  watch(selectedMetric, () => {
    loadHistory()
  })

  onMounted(() => {
    loadHistory()
  })

  return {
    historicalData,
    selectedMetric,
    isLoading,
    error,
    reload: loadHistory
  }
}