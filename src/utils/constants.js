export const RISK_LEVELS = {
  CRITICAL: { label: 'CRÍTICO', color: '#dc2626', bgColor: '#fee2e2', min: 0.90 },
  HIGH:     { label: 'ALTO',    color: '#ea580c', bgColor: '#ffedd5', min: 0.70 },
  MEDIUM:   { label: 'MEDIO',   color: '#eab308', bgColor: '#fef9c3', min: 0.40 },
  LOW:      { label: 'BAJO',    color: '#22c55e', bgColor: '#dcfce7', min: 0.00 }
}

// Fallbacks globales en UNIDADES REALES
export const SENSOR_THRESHOLDS = {
  humidity:    { critical: 80,   warning: 60   }, // %
  inclination: { critical: 25,   warning: 15   }, // ° 
  vibration:   { critical: 0.40, warning: 0.25 }  // g
}


export const ZONES = [
  { id: 'A', name: 'Zona Norte - Ladera A' },
  { id: 'B', name: 'Zona Sur - Ladera B' },
  { id: 'C', name: 'Zona Este - Sector C' },
  { id: 'D', name: 'Zona Oeste - Sector D' },
  { id: 'E', name: 'Zona Central - Ladera E' },
  { id: 'F', name: 'Zona Noreste - Sector F' }
]