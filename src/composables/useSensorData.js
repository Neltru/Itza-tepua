import { ref, computed, onMounted } from 'vue'
import { RISK_LEVELS, SENSOR_THRESHOLDS } from '@/utils/constants'
import { fetchSensors } from '@/utils/api'

export function useSensorData() {
  const sensors = ref([])
  const isLoading = ref(true)
  const error = ref(null)

  const loadSensors = async () => {
    isLoading.value = true
    error.value = null

    try {
      const data = await fetchSensors()
      // Se asume que "data" ya viene con el mismo formato
      sensors.value = data
    } catch (err) {
      console.error('Error al cargar sensores desde el endpoint', err)
      error.value = err instanceof Error ? err.message : 'Error desconocido al cargar sensores'
    } finally {
      isLoading.value = false
    }
  }

  onMounted(() => {
    loadSensors()
  })

  const getRiskLevel = (sensor, type) => {
    const value = sensor[type]
    let critical = SENSOR_THRESHOLDS[type].critical
    let warning = SENSOR_THRESHOLDS[type].warning

    const t = sensor.thresholds || {}
    if (type === 'humidity' && t.humedad_max != null) {
      critical = Number(t.humedad_max)
      warning = critical * 0.75
    } else if (type === 'inclination' && t.angulo_max != null) {
      critical = Number(t.angulo_max)
      warning = critical * 0.60
    } else if (type === 'vibration' && t.aceleracion_max != null) {
      critical = Number(t.aceleracion_max)
      warning = critical * 0.60
    }

    if (value >= critical) return 'CRITICAL'
    if (value >= warning) return 'HIGH'
    return 'LOW'
  }

  const getOverallRisk = (sensor) => {
    const humidityRisk = getRiskLevel(sensor, 'humidity')
    const inclinationRisk = getRiskLevel(sensor, 'inclination')
    const vibrationRisk = getRiskLevel(sensor, 'vibration')
    
    if ([humidityRisk, inclinationRisk, vibrationRisk].includes('CRITICAL')) {
      return 'CRITICAL'
    }
    if ([humidityRisk, inclinationRisk, vibrationRisk].includes('HIGH')) {
      return 'HIGH'
    }
    return 'LOW'
  }

  const averages = computed(() => ({
    humidity: sensors.value.length
      ? sensors.value.reduce((sum, s) => sum + s.humidity, 0) / sensors.value.length
      : 0,
    inclination: sensors.value.length
      ? sensors.value.reduce((sum, s) => sum + s.inclination, 0) / sensors.value.length
      : 0,
    vibration: sensors.value.length
      ? sensors.value.reduce((sum, s) => sum + s.vibration, 0) / sensors.value.length
      : 0
  }))

  const criticalZones = computed(() => 
    sensors.value.filter(s => getOverallRisk(s) === 'CRITICAL')
  )

  const totalRiskZones = computed(() => 
    sensors.value.filter(s => ['CRITICAL', 'HIGH'].includes(getOverallRisk(s))).length
  )

  return {
    sensors,
    averages,
    criticalZones,
    totalRiskZones,
    getRiskLevel,
    getOverallRisk,
    isLoading,
    error,
    reload: loadSensors
  }
}
