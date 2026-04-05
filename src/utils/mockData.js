export const MOCK_SENSORS = [
  { 
    id: 1, 
    zone: 'Zona Norte - Ladera A', 
    humidity: 45, 
    inclination: 5.2, 
    vibration: 0.02, 
    lastUpdate: new Date().toLocaleTimeString(), 
    thresholds: { humedad_max: 60, angulo_max: 15, aceleracion_max: 0.1 } 
  },
  { 
    id: 2, 
    zone: 'Zona Sur - Ladera B', 
    humidity: 82, 
    inclination: 12.1, 
    vibration: 0.05, 
    lastUpdate: new Date().toLocaleTimeString(), 
    thresholds: { humedad_max: 80, angulo_max: 20, aceleracion_max: 0.1 } 
  },
  { 
    id: 3, 
    zone: 'Zona Este - Sector C', 
    humidity: 30, 
    inclination: 2.1, 
    vibration: 0.01, 
    lastUpdate: new Date().toLocaleTimeString(), 
    thresholds: { humedad_max: 60, angulo_max: 15, aceleracion_max: 0.1 } 
  },
  { 
    id: 4, 
    zone: 'Zona Oeste - Sector D', 
    // Valores críticos para forzar una alerta visual 
    humidity: 55, 
    inclination: 26.5, 
    vibration: 0.45, 
    lastUpdate: new Date().toLocaleTimeString(), 
    thresholds: { humedad_max: 65, angulo_max: 25, aceleracion_max: 0.4 } 
  },
]

export const MOCK_COMPARISON = MOCK_SENSORS.map(s => ({
  zone: s.zone,
  humidity: s.humidity,
  inclination: s.inclination,
  vibration: s.vibration,
  thresholds: s.thresholds
}))

export function getMockHistory({ zoneId, metric, scope }) {
  const data = []
  const now = new Date()
  const points = scope === 'today' ? 24 : scope === 'week' ? 7 : 30
  
  for (let i = points; i >= 0; i--) {
    let time;
    if (scope === 'today') {
        time = new Date(now.getTime() - i * 3600000)
    } else {
        time = new Date(now.getTime() - i * 86400000)
    }

    let base = metric === 'humidity' ? 50 : metric === 'inclination' ? 10 : 0.05
    // Añadimos variación aleatoria para que parezca de verdad
    const randomVariation = (Math.random() - 0.5) * (base * 0.4)
    let value = base + randomVariation
    
    if (metric === 'vibration') {
        value = Math.max(0, value)
    }

    data.push({
      time: time.toISOString(),
      value: value
    })
  }

  return {
    zone: `Zona Demo ${zoneId}`,
    sensorId: zoneId,
    metric,
    scope,
    data
  }
}
