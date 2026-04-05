import { describe, it, expect, vi } from 'vitest'
import { ref } from 'vue'
import { useAlerts } from '../../src/composables/useAlerts'

// Mock useAlertSound to avoid audio context errors in tests
vi.mock('../../src/composables/useAlertSound', () => ({
  useAlertSound: () => ({
    playAlertSound: vi.fn(),
    stopAlertSound: vi.fn(),
    isMuted: ref(true)
  })
}))

describe('useAlerts', () => {
  it('detecta alertas críticas usando getOverallRisk', () => {
    const sensors = ref([
      { id: 1, zone: 'A', humidity: 50, inclination: 10, vibration: 0.01 }, // OK
      { id: 2, zone: 'B', humidity: 90, inclination: 10, vibration: 0.01 }  // CRITICAL
    ])
    
    // Simulamos un getOverallRisk que marca CRITICAL el sensor con ID 2
    const mockGetOverallRisk = vi.fn((sensor) => sensor.id === 2 ? 'CRITICAL' : 'LOW')
    
    const { activeAlerts } = useAlerts(sensors, mockGetOverallRisk)
    
    expect(activeAlerts.value.length).toBe(1)
    expect(activeAlerts.value[0].id).toBe(2)
  })

  it('permite descartar alertas manualmente', () => {
    const sensors = ref([
      { id: 2, zone: 'B', humidity: 90, inclination: 10, vibration: 0.01 }
    ])
    const { activeAlerts, dismissAlert } = useAlerts(sensors, () => 'CRITICAL')
    
    expect(activeAlerts.value.length).toBe(1)
    
    dismissAlert(0)
    
    expect(activeAlerts.value.length).toBe(0)
  })
})
