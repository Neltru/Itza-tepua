import { ref } from 'vue'
import { fetchSensorHistoryRaw } from '@/utils/api'

/** options: { metric:'humidity'|'inclination'|'vibration', scope:'today'|'week'|'month', zoneId:number } */
export function useHistoricalData(options = {}) {
  const selectedMetric = ref(options.metric || 'humidity')
  const selectedScope  = ref(options.scope  || 'week')
  const zoneId         = ref(options.zoneId || 1)

  const historicalData = ref([]) // [{ zone, sensorId, data:[{time,value}], ... }]
  const isLoading = ref(false)
  const error = ref(null)

  async function loadHistory() {
    isLoading.value = true
    error.value = null
    // RESET explícito para que el componente pinte “loading/empty” de inmediato
    historicalData.value = []

    try {
      const raw = await fetchSensorHistoryRaw({
        zoneId: zoneId.value,
        metric: selectedMetric.value,
        scope: selectedScope.value,
      })
      historicalData.value = [{
        zone: raw.zone,
        sensorId: raw.sensorId,
        data: Array.isArray(raw.data) ? raw.data : [],
        scope: raw.scope,
        metric: raw.metric,
      }]
    } catch (e) {
      if (e.name === 'AbortError') return // se canceló: no ensuciar estado
      console.error('[historyRaw]', e)
      error.value = e?.message || 'Error desconocido'
      historicalData.value = []
    } finally {
      isLoading.value = false
    }
  }

  return {
    historicalData,
    selectedMetric,
    selectedScope,
    zoneId,
    isLoading,
    error,
    loadHistory, // ← control manual
  }
}
