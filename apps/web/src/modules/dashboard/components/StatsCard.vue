<template>
  <div class="bg-surface-container-lowest p-6 rounded-xl relative overflow-hidden group shadow-sm">
    <div class="relative z-10">
      <p class="text-on-surface-variant text-sm font-medium">{{ title }}</p>
      <h3 class="text-4xl font-black mt-3" :class="valueColorClass">{{ displayValue }}</h3>
      <div v-if="trend" class="mt-4 inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-semibold" :class="trendClass">
        <span class="material-symbols-outlined text-[14px]">arrow_upward</span>
        <span>{{ trend }}</span>
      </div>
      <p v-if="subtitle" class="text-xs text-slate-400 mt-4">{{ subtitle }}</p>
      <slot name="progress"></slot>
    </div>
    <span class="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl opacity-5 -rotate-12 group-hover:rotate-0 transition-transform duration-500" :class="iconColorClass">
      {{ icon }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title: string
  value: string | number
  icon: string
  trend?: string
  subtitle?: string
  variant?: 'primary' | 'secondary' | 'tertiary' | 'error'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary'
})

const displayValue = computed(() => {
  const val = props.value
  if (typeof val === 'number') {
    return val >= 100 ? val.toLocaleString('pt-BR') : String(val)
  }
  return val
})

const valueColorClass = computed(() => {
  switch (props.variant) {
    case 'secondary': return 'text-secondary'
    case 'tertiary': return 'text-tertiary'
    case 'error': return 'text-error'
    default: return 'text-primary'
  }
})

const iconColorClass = computed(() => {
  switch (props.variant) {
    case 'secondary': return 'text-secondary'
    case 'tertiary': return 'text-tertiary'
    case 'error': return 'text-error'
    default: return 'text-primary'
  }
})

const trendClass = computed(() => {
  switch (props.variant) {
    case 'error': return 'bg-error-container text-on-error-container'
    case 'tertiary': return 'bg-tertiary-container text-on-tertiary-fixed'
    default: return 'bg-secondary-container text-on-secondary-container'
  }
})
</script>

<style scoped>
.material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>