<template>
  <div class="bg-surface-container-lowest p-5 rounded-xl flex items-center justify-between group hover:bg-white shadow-sm transition-colors cursor-pointer" @click="$emit('click')">
    <div class="flex items-center gap-5">
      <div class="w-14 h-14 bg-surface-container-low rounded-xl overflow-hidden flex items-center justify-center text-primary/50">
        <span class="material-symbols-outlined text-3xl">{{ icon }}</span>
      </div>
      <div>
        <h4 class="font-bold text-cyan-950">{{ title }}</h4>
        <p class="text-sm text-slate-500 flex items-center gap-2 mt-1">
          <span class="material-symbols-outlined text-sm">schedule</span>
          {{ schedule }}
        </p>
      </div>
    </div>
    <div class="flex items-center gap-6 text-right">
      <div>
        <p class="text-xs font-medium text-slate-400">Morador</p>
        <p class="text-sm font-semibold text-cyan-900">{{ resident }}</p>
      </div>
      <span :class="['py-1.5 px-4 rounded-full text-[11px] font-bold uppercase tracking-wider', statusClass]">
        {{ status }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  title: string
  schedule: string
  resident: string
  status: 'Confirmado' | 'Pendente' | 'Cancelado'
  icon?: string
}>(), {
  icon: 'celebration'
})

defineEmits<{
  click: []
}>()

const statusClass = computed(() => {
  switch (props.status) {
    case 'Confirmado': return 'bg-tertiary-container text-on-tertiary-fixed'
    case 'Pendente': return 'bg-secondary-container text-on-secondary-container'
    case 'Cancelado': return 'bg-error-container text-on-error-container'
    default: return 'bg-secondary-container text-on-secondary-container'
  }
})
</script>

<style scoped>
.material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>