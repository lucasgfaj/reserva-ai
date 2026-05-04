<template>
  <section>
    <h2 class="text-3xl font-extrabold text-primary tracking-tight font-headline">{{ title }}</h2>
    <p class="text-on-surface-variant mt-2 font-body">{{ description }}</p>
  </section>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  description: string
}>(), {
  title: 'Dashboard Principal',
  description: 'Bem-vindo de volta! Aqui está o resumo das atividades do condomínio hoje.'
})
</script>

<style scoped>
.font-headline { font-family: 'Manrope', sans-serif; }
.font-body { font-family: 'Inter', sans-serif; }
</style>