import { ref, onMounted, watch } from 'vue'
import { fetchSensorComparison } from '@/utils/api'

export function useComparisonData() {
  const comparisonData = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  const loadComparison = async () => {
    isLoading.value = true
    error.value = null

    try {
      const data = await fetchSensorComparison()
      comparisonData.value = data
    } catch (err) {
      console.error('Error al cargar datos de comparación:', err)
      error.value = err.message
      // Fallback a datos vacíos
      comparisonData.value = []
    } finally {
      isLoading.value = false
    }
  }

  onMounted(() => {
    loadComparison()
  })

  return {
    comparisonData,
    isLoading,
    error,
    reload: loadComparison
  }
}