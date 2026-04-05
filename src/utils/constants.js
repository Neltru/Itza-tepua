export const RISK_LEVELS = {
  CRITICAL: { label: 'CRÍTICO', color: '#dc2626', bgColor: '#fee2e2', min: 0.90 },
  HIGH:     { label: 'ALTO',    color: '#ea580c', bgColor: '#ffedd5', min: 0.70 },
  MEDIUM:   { label: 'MEDIO',   color: '#eab308', bgColor: '#fef9c3', min: 0.40 },
  LOW:      { label: 'BAJO',    color: '#22c55e', bgColor: '#dcfce7', min: 0.00 }
}

// Fallbacks globales en UNIDADES REALES
export const SENSOR_THRESHOLDS = {
  humidity:    { critical: 55,   warning: 45   }, // %
  inclination: { critical: 90,   warning: 86.1   }, // ° 
  vibration:   { critical: 0.04, warning: 0.05 }  // g
}
