const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://6717ec5fb910c6a6e02a901f.mockapi.io/api/v1'

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

// Obtener historial de un sensor específico
export async function fetchSensorHistoryById(sensorId, timeRange = '24h') {
  const response = await fetch(`${API_BASE_URL}/sensors/${sensorId}/history?range=${timeRange}`)
  return handleResponse(response)
}

// Obtener estadísticas generales
export async function fetchStatistics() {
  const response = await fetch(`${API_BASE_URL}/statistics`)
  return handleResponse(response)
}