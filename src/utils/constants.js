export const RISK_LEVELS = {
  CRITICAL: {
    label: 'CRÍTICO',
    color: '#dc2626',
    bgColor: '#fee2e2',
    min: 80
  },
  HIGH: {
    label: 'ALTO',
    color: '#ea580c',
    bgColor: '#ffedd5',
    min: 60
  },
  LOW: {
    label: 'BAJO',
    color: '#22c55e',
    bgColor: '#dcfce7',
    min: 0
  }
}

export const SENSOR_THRESHOLDS = {
  humidity: { critical: 80, warning: 60 },
  inclination: { critical: 10, warning: 6 },
  vibration: { critical: 40, warning: 25 }
}

export const ZONES = [
  { id: 'A', name: 'Zona Norte - Ladera A' },
  { id: 'B', name: 'Zona Sur - Ladera B' },
  { id: 'C', name: 'Zona Este - Sector C' },
  { id: 'D', name: 'Zona Oeste - Sector D' },
  { id: 'E', name: 'Zona Central - Ladera E' },
  { id: 'F', name: 'Zona Noreste - Sector F' }
]