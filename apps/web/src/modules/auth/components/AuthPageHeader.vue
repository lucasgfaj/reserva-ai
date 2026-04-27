<template>
  <div class="mb-10">
    <h2 class="text-3xl font-bold text-on-surface tracking-tight" :class="description ? 'mb-2' : ''">
      {{ title }}
    </h2>
    <p v-if="description" class="text-on-surface-variant font-medium text-sm">
      {{ description }}
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>
