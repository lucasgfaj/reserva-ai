<template>
  <router-link 
    to="/" 
    class="flex items-center gap-3 transition-all group"
    v-bind="$attrs"
  >
    <div class="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
      <span class="material-symbols-outlined text-2xl group-hover:-translate-x-1 transition-transform">arrow_back</span>
    </div>
    <span class="text-sm font-bold uppercase tracking-widest text-on-surface-variant group-hover:text-primary transition-colors">Voltar para a página inicial</span>
  </router-link>
</template>

<script setup lang="ts">
// No logic needed
</script>
