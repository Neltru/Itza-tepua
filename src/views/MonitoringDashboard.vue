<template>
  <div class="monitoring-dashboard">
    <Header :has-alerts="activeAlerts.length > 0" />
    
    <AlertBanner 
      v-if="activeAlerts[0]" 
      :alert="activeAlerts[0]"
      :is-muted="isMuted"
      @dismiss="dismissAlert(0)"
      @toggle-mute="toggleMute"
    />

    <main class="dashboard-content">
      <!-- Stats Grid -->
      <section class="stats-section">
        <StatCard
          icon="💧"
          label="Humedad Promedio"
          :value="averages.humidity"
          unit="%"
          :is-loading="isLoading"
          :threshold="thHumidity"
          :precision="1"
          show-threshold-hint
        />

        <StatCard
          icon="📐"
          label="Inclinación Promedio"
          :value="averages.inclination"
          unit="°"
          :is-loading="isLoading"
          :threshold="thInclination"
          :precision="1"
          show-threshold-hint
        />

        <StatCard
          icon="📳"
          label="Aceleración Promedio"
          :value="averages.vibration"
          unit=" g"
          :is-loading="isLoading"
          :threshold="thVibration"
          :precision="2"
          show-threshold-hint
        />

        <RiskCard 
          :total-risk-zones="totalRiskZones" 
          :is-loading="isLoading"
        />
      </section>

      <!-- Main Content Grid -->
      <section class="main-grid">
        <div class="left-column">
          <SensorTable 
            :sensors="sensors" 
            :get-risk-level="getOverallRisk"
            :is-loading="isLoading"
            :error="error"
            @reload="reload"
          />
        </div>
        
        <div class="right-column">
          <ComparisonChart :sensors="sensors" />
          <TimeSeriesChart :sensors="sensors" />
        </div>
      </section>
    </main>

    <Footer :sensor-count="sensors.length" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import Header from '@/components/layout/Header.vue'
import AlertBanner from '@/components/layout/AlertBanner.vue'
import Footer from '@/components/layout/Footer.vue'
import StatCard from '@/components/cards/StatCard.vue'
import RiskCard from '@/components/cards/RiskCard.vue'
import SensorTable from '@/components/tables/SensorTable.vue'
import ComparisonChart from '@/components/charts/ComparisonChart.vue'
import TimeSeriesChart from '@/components/charts/TimeSeriesChart.vue'
import { useSensorData } from '@/composables/useSensorData'
import { useAlerts } from '@/composables/useAlerts'
import { useAlertSound } from '@/composables/useAlertSound'
import { fetchSensorComparison } from '@/utils/api'  // ← nuevo import

const { 
  sensors,
  averages,
  totalRiskZones,
  getOverallRisk,
  isLoading,
  error,
  reload
} = useSensorData()

const { activeAlerts, dismissAlert } = useAlerts(sensors)
const { isMuted, toggleMute, loadMutePreference, cleanup } = useAlertSound()

// ---- Umbrales dinámicos (mediana por zona) ----
const dashThresholds = ref({
  humidity: null,      // %
  inclination: null,   // °
  vibration: null      // g
})

function median(arr) {
  const xs = arr.filter(n => Number.isFinite(n)).sort((a,b)=>a-b)
  if (!xs.length) return null
  const m = Math.floor(xs.length/2)
  return xs.length % 2 ? xs[m] : (xs[m-1] + xs[m]) / 2
}

async function loadDashThresholds() {
  try {
    const rows = await fetchSensorComparison() // ya llama ?with_thresholds=1
    const hs = rows.map(r => r.thresholds?.humedad_max).map(Number).filter(Number.isFinite)
    const as = rows.map(r => r.thresholds?.angulo_max).map(Number).filter(Number.isFinite)
    const gs = rows.map(r => r.thresholds?.aceleracion_max).map(Number).filter(Number.isFinite)

    // Fallbacks sensatos si no hay umbrales en el back (en unidades REALES)
    dashThresholds.value.humidity    = median(hs) ?? 80     // %
    dashThresholds.value.inclination = median(as) ?? 25     // °
    dashThresholds.value.vibration   = median(gs) ?? 0.40   // g
  } catch (e) {
    // Fallback si la API falla
    dashThresholds.value = { humidity: 80, inclination: 25, vibration: 0.40 }
  }
}

const thHumidity = computed(() => {
  const c = dashThresholds.value.humidity
  return { warning: c ? c * 0.75 : 60, critical: c ?? 80 }
})
const thInclination = computed(() => {
  const c = dashThresholds.value.inclination
  return { warning: c ? c * 0.60 : 10, critical: c ?? 25 }
})
const thVibration = computed(() => {
  const c = dashThresholds.value.vibration
  return { warning: c ? c * 0.60 : 0.25, critical: c ?? 0.40 }
})

onMounted(() => {
  loadMutePreference()
  loadDashThresholds()   // ← carga umbrales al entrar
})

onUnmounted(() => {
  cleanup()
})
</script>


<style scoped>
.monitoring-dashboard {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f3f4f6;
}

.dashboard-content {
  flex: 1;
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  width: 100%;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.main-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.left-column,
.right-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

@media (max-width: 1024px) {
  .main-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .dashboard-content {
    padding: 1rem;
  }
  
  .stats-section {
    grid-template-columns: 1fr;
  }
}
</style>