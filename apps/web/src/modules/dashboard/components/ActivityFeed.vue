<template>
  <section>
    <div class="flex items-center justify-between mb-5">
      <h3 class="text-lg font-bold text-cyan-900">Atividades Recentes</h3>
      <button class="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors">
        <span class="material-symbols-outlined">more_horiz</span>
      </button>
    </div>
    
    <div class="space-y-6">
      <div v-for="activity in activities" :key="activity.id" class="flex gap-4">
        <div :class="['flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center', activity.iconBgClass]">
          <span :class="['material-symbols-outlined text-sm', activity.iconClass]">{{ activity.icon }}</span>
        </div>
        <div>
          <p class="text-sm text-cyan-950 leading-snug">
            <span class="font-bold">{{ activity.label }}:</span> {{ activity.description }}
          </p>
          <p class="text-[11px] text-slate-400 mt-1 uppercase font-bold tracking-wider">{{ activity.time }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  activities: Array<{
    id: string
    label: string
    description: string
    time: string
    icon: string
    iconClass: string
    iconBgClass: string
  }>
}>()
</script>

<style scoped>
.material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>