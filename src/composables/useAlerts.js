import { ref, watch } from 'vue'
import { useAlertSound } from './useAlertSound'

export function useAlerts(sensors, getOverallRisk) {
  const activeAlerts = ref([])
  const { playAlertSound, stopAlertSound, isMuted } = useAlertSound()

  const checkAlerts = () => {
    const previousCount = activeAlerts.value.length

    activeAlerts.value = sensors.value
      .filter(sensor => {
        if (getOverallRisk) {
          return getOverallRisk(sensor) === 'CRITICAL'
        }
        return sensor.humidity >= 80 || 
               sensor.inclination >= 25 || 
               sensor.vibration >= 0.40
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
      
      if ('Notification' in window && Notification.permission === 'granted') {
         new Notification("¡Alerta en Itza-Tepua!", {
           body: `Zonas críticas reportadas: ${activeAlerts.value.map(a => a.zone).join(', ')}`,
           icon: '/vite.svg'
         })
      }
    }

    // Detener sonido si no hay alertas
    if (activeAlerts.value.length === 0) {
      stopAlertSound()
    }
  }

  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
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