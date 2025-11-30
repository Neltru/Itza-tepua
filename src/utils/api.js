const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

// Función auxiliar para manejar errores
async function handleResponse(response) {
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`)
  }
  return response.json()
}

// Obtener datos de sensores
export async function fetchSensors() {
  const url = `${API_BASE_URL}/sensors`

  // console.log("URL que se está llamando:", url)

  const response = await fetch(url, {
    headers: {
      "Accept": "application/json",
    },
  })

  const raw = await response.text()
  // console.log("Respuesta cruda del servidor:", raw)

  try {
    return JSON.parse(raw)
  } catch (e) {
    // console.error("¡¡ERROR!! El servidor NO devolvió JSON")
    throw new Error("El servidor devolvió HTML o texto no JSON")
  }
}


// Obtener datos de comparativa de sensores (para ComparisonChart)
export async function fetchSensorComparison() {
  const url = `${API_BASE_URL}/sensor-comparison?with_thresholds=1`
  const response = await fetch(url, { headers: { "Accept": "application/json" } })
  const raw = await response.text()
  try {
    return JSON.parse(raw)
  } catch {
    throw new Error("El servidor devolvió HTML o texto no JSON")
  }
}

// Obtener datos históricos (para TimeSeriesChart)
// params: { zoneId=1, metric='humidity'|'inclination'|'vibration', range='7d'|'14d'|'30d'|'24h', granularity='day'|'hour' }
let historyAbort = null

export async function fetchSensorHistoryRaw({ zoneId = 1, metric = 'humidity', scope = 'week', baseDate, tz } = {}) {
  if (historyAbort) historyAbort.abort()
  historyAbort = new AbortController()

  const params = new URLSearchParams({
    metric,
    scope, // today | week | month
    baseDate: baseDate || new Date().toISOString().slice(0, 10), // YYYY-MM-DD (local)
    tz: tz || Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Mazatlan',
  })
  const url = `${API_BASE_URL}/sensor-history/${zoneId}/raw?${params.toString()}`

  const res = await fetch(url, { headers: { Accept: 'application/json' }, signal: historyAbort.signal })
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`)
  return res.json()
}