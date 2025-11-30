<template>
  <span class="risk-badge" :class="riskClass">
    {{ riskLabel }}
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { RISK_LEVELS } from '@/utils/constants'

const props = defineProps({
  level: { type: String, default: 'LOW' }
})

const safeLevel = computed(() => RISK_LEVELS[props.level] ? props.level : 'LOW')
const riskConfig = computed(() => RISK_LEVELS[safeLevel.value])
const riskClass = computed(() => safeLevel.value.toLowerCase())
const riskLabel = computed(() => riskConfig.value.label)
</script>


<style scoped>
.risk-badge {
  padding: 0.375rem 0.875rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.risk-badge.critical {
  background: #fee2e2;
  color: #991b1b;
}

.risk-badge.high {
  background: #ffedd5;
  color: #9a3412;
}

.risk-badge.medium {
  background: #fef9c3;
  color: #854d0e;
}

.risk-badge.low {
  background: #dcfce7;
  color: #14532d;
}
</style>