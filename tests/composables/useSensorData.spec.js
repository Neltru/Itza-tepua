import { describe, it, expect, vi } from 'vitest'
import { useSensorData } from '../../src/composables/useSensorData'
import { SENSOR_THRESHOLDS } from '../../src/utils/constants'

vi.mock('../../src/utils/api', () => ({
  fetchSensors: vi.fn(() => Promise.resolve([]))
}))

describe('useSensorData', () => {
  it('getRiskLevel usa umbrales globales por defecto', () => {
    const { getRiskLevel } = useSensorData()
    const sensor = { humidity: SENSOR_THRESHOLDS.humidity.critical + 1 }
    
    expect(getRiskLevel(sensor, 'humidity')).toBe('CRITICAL')
  })

  it('getRiskLevel prioriza umbrales del sensor si existen', () => {
    const { getRiskLevel } = useSensorData()
    
    const globalCritical = SENSOR_THRESHOLDS.humidity.critical // Ej: 55
    const sensorConUmbralAlto = {
      humidity: globalCritical + 5, // 60%, sería crítico bajo regla global
      thresholds: {
        humedad_max: globalCritical + 20 // 75%, el umbral es más alto
      }
    }
    
    // Debería ser WARNING (o LOW/HIGH según el cálculo) pero no CRITICAL porque no superó 75
    // En nuestro caso el warning es 75 * 0.75 = 56.25. Como 60 >= 56.25, es HIGH.
    expect(getRiskLevel(sensorConUmbralAlto, 'humidity')).toBe('HIGH')
  })

  it('getOverallRisk retorna el mayor nivel de riesgo entre todas las métricas', () => {
    const { getOverallRisk } = useSensorData()
    
    const sensorMedium = {
      humidity: SENSOR_THRESHOLDS.humidity.warning - 10,
      inclination: SENSOR_THRESHOLDS.inclination.warning + 1, // HIGH
      vibration: SENSOR_THRESHOLDS.vibration.warning - 0.01
    }
    expect(getOverallRisk(sensorMedium)).toBe('HIGH')

    const sensorCritical = {
      humidity: SENSOR_THRESHOLDS.humidity.critical + 1, // CRITICAL
      inclination: 0,
      vibration: 0
    }
    expect(getOverallRisk(sensorCritical)).toBe('CRITICAL')
  })
})
