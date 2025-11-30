import { ref } from 'vue'
import { fetchSensorComparison } from '@/utils/api'

export function useComparisonData() {
  const comparisonData = ref([])
  const thresholds = ref({
    humedad_max: null,
    angulo_max: null,
    aceleracion_max: null,
    source: 'fallback'
  })

  const isLoading = ref(false)
  const error = ref(null)

  const loadComparison = async () => {
    isLoading.value = true
    error.value = null
    comparisonData.value = []
    thresholds.value = { humedad_max: null, angulo_max: null, aceleracion_max: null, source: 'fallback' }

    try {
      const data = await fetchSensorComparison() // ideal: /sensor-comparison?with_thresholds=1
      // Coerción segura a número
      const clean = (Array.isArray(data) ? data : []).map(item => ({
        zone: item.zone || 'Zona',
        humidity: item.humidity != null ? Number(item.humidity) : null,
        inclination: item.inclination != null ? Number(item.inclination) : null,
        vibration: item.vibration != null ? Number(item.vibration) : null,
        thresholds: item.thresholds || null
      }))

      comparisonData.value = clean

      // Tomar umbrales si vienen en el payload (preferentemente consistentes entre zonas)
      const tCandidates = clean.map(x => x.thresholds).filter(Boolean)
      if (tCandidates.length) {
        // Si hay varios, elegimos el primero o, si difieren, tomamos promedio simple
        const hm = tCandidates.map(t => Number(t.humedad_max)).filter(n => Number.isFinite(n))
        const am = tCandidates.map(t => Number(t.angulo_max)).filter(n => Number.isFinite(n))
        const vm = tCandidates.map(t => Number(t.aceleracion_max)).filter(n => Number.isFinite(n))

        thresholds.value = {
          humedad_max: hm.length ? (hm.reduce((a,b)=>a+b,0)/hm.length) : null,
          angulo_max:  am.length ? (am.reduce((a,b)=>a+b,0)/am.length) : null,
          aceleracion_max: vm.length ? (vm.reduce((a,b)=>a+b,0)/vm.length) : null,
          source: 'backend'
        }
      } else {
        // Fallback suave si el back aún no manda umbrales
        thresholds.value = { humedad_max: 80, angulo_max: 10, aceleracion_max: 40, source: 'fallback' }
      }
    } catch (err) {
      console.error('Error al cargar datos de comparación:', err)
      error.value = err?.message || 'Error desconocido'
      comparisonData.value = []
      thresholds.value = { humedad_max: 80, angulo_max: 10, aceleracion_max: 40, source: 'fallback' }
    } finally {
      isLoading.value = false
    }
  }

  return {
    comparisonData,
    thresholds,
    isLoading,
    error,
    reload: loadComparison,
    loadComparison 
  }
}
