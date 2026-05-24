<template>
  <div class="mb-8">
    <div class="flex items-center gap-2 mb-2">
      <div class="h-1 flex-1 bg-surface-container-highest rounded-full overflow-hidden">
        <div 
          class="h-full signature-gradient transition-all duration-500"
          :style="{ width: progress + '%' }"
        ></div>
      </div>
      <span class="text-[10px] font-bold text-primary uppercase tracking-widest whitespace-nowrap">Etapa {{ current }}/{{ total }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  current: number
  total: number
  progress: number
}>()
</script>
