const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://69d9f851113d.ngrok-free.app/api'

// Función auxiliar para manejar errores
async function handleResponse(response) {
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`)
  }
  return response.json()
}

// Obtener datos de sensores
export async function fetchSensors() {
  const response = await fetch(`${API_BASE_URL}/sensors`)
  return handleResponse(response)
}

// Obtener datos de comparativa de sensores (para ComparisonChart)
export async function fetchSensorComparison() {
  const response = await fetch(`${API_BASE_URL}/sensor-comparison`)
  return handleResponse(response)
}

// Obtener datos históricos (para TimeSeriesChart)
export async function fetchSensorHistory(metric = 'humidity', timeRange = '24h') {
  const response = await fetch(`${API_BASE_URL}/sensor-history?metric=${metric}&range=${timeRange}`)
  return handleResponse(response)
}
