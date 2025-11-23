const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://6717ec5fb910c6a6e02a901f.mockapi.io/api/v1'

export async function fetchSensors() {
  const response = await fetch(`${API_BASE_URL}/sensors`)

  if (!response.ok) {
    throw new Error(`Error al obtener sensores: ${response.status} ${response.statusText}`)
  }

  // Debe devolver un array con el mismo formato que el que antes estaba hardcodeado en useSensorData
  const data = await response.json()
  return data
}
