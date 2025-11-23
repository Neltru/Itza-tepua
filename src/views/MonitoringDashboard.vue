<template>
  <div class="monitoring-dashboard">
    <Header :has-alerts="activeAlerts.length > 0" />
    
    <AlertBanner 
      v-if="activeAlerts[0]" 
      :alert="activeAlerts[0]"
      @dismiss="dismissAlert(0)"
    />

    <main class="dashboard-content">
      <!-- Stats Grid -->
      <section class="stats-section">
        <StatCard
          icon="💧"
          label="Humedad Promedio"
          :value="averages.humidity"
          unit="%"
          status="Normal"
        />
        <StatCard
          icon="📐"
          label="Inclinación Promedio"
          :value="averages.inclination"
          unit="°"
          status="Estable"
       
        />
        <StatCard
          icon="📳"
          label="Vibración Promedio"
          :value="averages.vibration"
          unit=" Hz"
          status="Normal"
        />
        <RiskCard :total-risk-zones="totalRiskZones" />
      </section>

      <!-- Main Content Grid -->
      <section class="main-grid">
        <div class="left-column">
          <SensorTable 
            :sensors="sensors" 
            :get-risk-level="getOverallRisk"
          />
        </div>
        
        <div class="right-column">
          <ComparisonChart :sensors="sensors" />
          <TimeSeriesChart :sensors="sensors" />
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import Header from '@/components/layout/Header.vue'
import AlertBanner from '@/components/layout/AlertBanner.vue'
import StatCard from '@/components/cards/StatCard.vue'
import RiskCard from '@/components/cards/RiskCard.vue'
import SensorTable from '@/components/tables/SensorTable.vue'
import ComparisonChart from '@/components/charts/ComparisonChart.vue'
import TimeSeriesChart from '@/components/charts/TimeSeriesChart.vue'
import { useSensorData } from '../composables/useSensorData.js'
import { useAlerts } from '../composables/useAlerts.js'

const { 
  sensors, 
  averages, 
  totalRiskZones,
  getOverallRisk 
} = useSensorData()

const { activeAlerts, dismissAlert } = useAlerts(sensors)
</script>

<style scoped>
.monitoring-dashboard {
  min-height: 100vh;
  background: #f3f4f6;
}

.dashboard-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
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