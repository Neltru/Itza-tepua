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
  const url = `${API_BASE_URL}/sensors`

  console.log("URL que se está llamando:", url)

  const response = await fetch(url, {
    headers: {
      "Accept": "application/json",
    },
  })

  const raw = await response.text()
  console.log("Respuesta cruda del servidor:", raw)

  try {
    return JSON.parse(raw)
  } catch (e) {
    console.error("¡¡ERROR!! El servidor NO devolvió JSON")
    throw new Error("El servidor devolvió HTML o texto no JSON")
  }
}


// Obtener datos de comparativa de sensores (para ComparisonChart)
export async function fetchSensorComparison() {
  const url = `${API_BASE_URL}/sensor-comparison`

  console.log("URL que se está llamando:", url)

  const response = await fetch(url, {
    headers: {
      "Accept": "application/json",
    },
  })

  const raw = await response.text()
  console.log("Respuesta cruda del servidor:", raw)

  try {
    return JSON.parse(raw)
  } catch (e) {
    console.error("¡¡ERROR!! El servidor NO devolvió JSON")
    throw new Error("El servidor devolvió HTML o texto no JSON")
  }
}

// Obtener datos históricos (para TimeSeriesChart)
export async function fetchSensorHistory(metric = 'humidity', timeRange = '24h') {
  const response = await fetch(`${API_BASE_URL}/sensor-history?metric=${metric}&range=${timeRange}`)
  return handleResponse(response)
}
