const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://c14c1d02e568.ngrok-free.app/api'

// Headers comunes para todas las peticiones (incluye bypass de ngrok)
const commonHeaders = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true',  // ← CRÍTICO: Evita página de advertencia de ngrok
  'User-Agent': 'IoTDashboard/1.0'       // ngrok a veces requiere un User-Agent válido
}

// Función auxiliar para manejar errores
async function handleResponse(response) {
  // Primero verificar si la respuesta es realmente JSON
  const contentType = response.headers.get('content-type')
  
  if (!response.ok) {
    const errorText = await response.text()
    console.error('Error del servidor:', errorText)
    throw new Error(`Error ${response.status}: ${response.statusText}`)
  }

  // Si no es JSON, lanzar error descriptivo
  if (!contentType || !contentType.includes('application/json')) {
    const htmlText = await response.text()
    console.error('El servidor devolvió HTML en lugar de JSON:', htmlText.substring(0, 500))
    throw new Error('El servidor devolvió HTML o texto no JSON. Verifica que Laravel esté respondiendo correctamente.')
  }

  return response.json()
}

// Obtener datos de sensores
export async function fetchSensors() {
  const url = `${API_BASE_URL}/sensors`
  console.log('📡 Llamando a:', url)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: commonHeaders,
      mode: 'cors'  // Asegura que se manejen correctamente las peticiones CORS
    })

    return await handleResponse(response)
  } catch (error) {
    console.error('❌ Error en fetchSensors:', error)
    throw error
  }
}

// Obtener datos de comparativa de sensores (para ComparisonChart)
export async function fetchSensorComparison() {
  const url = `${API_BASE_URL}/sensor-comparison`
  console.log('📡 Llamando a:', url)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: commonHeaders,
      mode: 'cors'
    })

    return await handleResponse(response)
  } catch (error) {
    console.error('❌ Error en fetchSensorComparison:', error)
    throw error
  }
}

// Obtener datos históricos (para TimeSeriesChart)
// params: { zoneId=1, metric='humidity'|'inclination'|'vibration', scope='today'|'week'|'month', baseDate, tz }
let historyAbort = null

export async function fetchSensorHistoryRaw({ 
  zoneId = 1, 
  metric = 'humidity', 
  scope = 'week', 
  baseDate, 
  tz 
} = {}) {
  // Cancelar petición anterior si existe
  if (historyAbort) {
    historyAbort.abort()
  }
  historyAbort = new AbortController()

  const params = new URLSearchParams({
    metric,
    scope, // today | week | month
    baseDate: baseDate || new Date().toISOString().slice(0, 10), // YYYY-MM-DD
    tz: tz || Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Mazatlan',
  })
  
  const url = `${API_BASE_URL}/sensor-history/${zoneId}/raw?${params.toString()}`
  console.log('📡 Llamando a:', url)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: commonHeaders,
      signal: historyAbort.signal,
      mode: 'cors'
    })

    return await handleResponse(response)
  } catch (error) {
    // No lanzar error si fue abortado intencionalmente
    if (error.name === 'AbortError') {
      console.log('⚠️ Petición cancelada')
      return null
    }
    console.error('❌ Error en fetchSensorHistoryRaw:', error)
    throw error
  }
}

// Enviar lectura desde ESP32 (si lo necesitas en el frontend)
export async function postReading(data) {
  const url = `${API_BASE_URL}/lecturas`
  console.log('📤 Enviando lectura a:', url)

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: commonHeaders,
      body: JSON.stringify(data),
      mode: 'cors'
    })

    return await handleResponse(response)
  } catch (error) {
    console.error('❌ Error en postReading:', error)
    throw error
  }
}

// Función de prueba/diagnóstico
export async function testConnection() {
  console.log('🔍 Probando conexión con:', API_BASE_URL)
  
  try {
    const response = await fetch(API_BASE_URL.replace('/api', '/api/health'), {
      headers: commonHeaders
    })
    
    if (response.ok) {
      console.log('✅ Conexión exitosa')
      return true
    } else {
      console.error('❌ Servidor respondió con error:', response.status)
      return false
    }
  } catch (error) {
    console.error('❌ No se pudo conectar:', error.message)
    return false
  }
}