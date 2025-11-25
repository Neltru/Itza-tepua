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
          :threshold="{ warning: 60, critical: 80 }"
        />
        <StatCard
          icon="📐"
          label="Inclinación Promedio"
          :value="averages.inclination"
          unit="°"
          :is-loading="isLoading"
          :threshold="{ warning: 6, critical: 10 }"
        />
        <StatCard
          icon="📳"
          label="Vibración Promedio"
          :value="averages.vibration"
          unit=" Hz"
          :is-loading="isLoading"
          :threshold="{ warning: 25, critical: 40 }"
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
import { onMounted, onUnmounted } from 'vue'
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

onMounted(() => {
  loadMutePreference()
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