<template>
  <div
    v-if="isLoading"
    class="fixed top-0 left-0 z-[9999] w-full h-1 pointer-events-none"
  >
    <div class="h-full bg-primary animate-loading-bar rounded-r-full" />
  </div>
</template>

<script setup lang="ts">
import { useLoading } from '../composables/useLoading'

const { isLoading } = useLoading()
</script>

<style scoped>
@keyframes loading {
  0% { width: 0; margin-left: 0; }
  30% { width: 30%; margin-left: 0; }
  70% { width: 60%; margin-left: 40%; }
  100% { width: 100%; margin-left: 0; }
}
.animate-loading-bar {
  animation: loading 1.2s ease-in-out infinite;
}
</style>
