<template>
  <section>
    <h3 class="text-lg font-bold text-cyan-900 mb-5">Ações Rápidas</h3>
    <div class="grid grid-cols-2 gap-4">
      <button 
        v-for="action in actions" 
        :key="action.id"
        @click="$emit('action', action.id)"
        :class="['p-6 rounded-xl text-left flex flex-col justify-between h-32 transition-transform shadow-sm group', action.primary ? 'bg-primary text-white hover:translate-y-[-4px] shadow-lg shadow-primary/10' : 'bg-surface-container-lowest p-6 rounded-xl text-left flex flex-col justify-between h-32 hover:translate-y-[-4px] transition-transform shadow-sm group border border-slate-100']"
      >
        <span :class="['material-symbols-outlined text-3xl group-hover:scale-110 transition-transform', action.primary ? '' : 'text-cyan-900']">
          {{ action.icon }}
        </span>
        <span :class="['font-bold text-sm leading-tight', action.primary ? '' : 'text-cyan-900']">
          {{ action.label }}
        </span>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  actions: Array<{
    id: string
    label: string
    icon: string
    primary?: boolean
  }>
}>()

defineEmits<{
  action: [id: string]
}>()
</script>

<style scoped>
.material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>