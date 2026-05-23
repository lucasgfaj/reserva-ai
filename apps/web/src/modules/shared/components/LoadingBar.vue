<template>
  <div v-if="isLoading" class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/10 pointer-events-auto">
    <div class="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin shadow-lg bg-white" />
  </div>
</template>

<script setup lang="ts">
import { useLoading } from '../composables/useLoading'

const { isLoading } = useLoading()
</script>
