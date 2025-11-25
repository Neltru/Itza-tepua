import { ref, watch } from 'vue'
import { useAlertSound } from './useAlertSound'

export function useAlerts(sensors) {
  const activeAlerts = ref([])
  const { playAlertSound, stopAlertSound, isMuted } = useAlertSound()

  const checkAlerts = () => {
    const previousCount = activeAlerts.value.length

    activeAlerts.value = sensors.value
      .filter(sensors => {
        return sensors.humidity >= 80 || 
               sensors.inclination >= 10 || 
               sensors.vibration >= 40
      })
      .map(sensor => ({
        id: sensor.id,
        zone: sensor.zone,
        humidity: sensor.humidity,
        inclination: sensor.inclination,
        vibration: sensor.vibration,
        timestamp: new Date()
      }))

    // Reproducir sonido si hay nuevas alertas
    if (activeAlerts.value.length > previousCount && activeAlerts.value.length > 0) {
      playAlertSound()
    }

    // Detener sonido si no hay alertas
    if (activeAlerts.value.length === 0) {
      stopAlertSound()
    }
  }

  watch(sensors, checkAlerts, { deep: true, immediate: true })

  const dismissAlert = (index) => {
    activeAlerts.value.splice(index, 1)
    if (activeAlerts.value.length === 0) {
      stopAlertSound()
    }
  }

  return {
    activeAlerts,
    dismissAlert,
    isMuted,
    stopAlertSound
  }
}