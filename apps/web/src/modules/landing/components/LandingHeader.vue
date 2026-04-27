<template>
  <header class="fixed top-0 w-full z-50 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-xl">
    <nav class="flex items-center justify-between px-10 py-5 w-full max-w-7xl mx-auto">
      <div class="flex items-center gap-2">
        <span class="font-manrope font-extrabold text-sky-900 dark:text-sky-300 tracking-tight text-2xl">Reserva Aí!</span>
      </div>
      <div class="hidden md:flex items-center gap-8">
        <a class="font-manrope font-semibold text-sm text-sky-900 dark:text-sky-300 hover:text-sky-700 transition-colors" href="#">Funcionalidades</a>
        <a class="font-manrope font-semibold text-sm text-slate-500 dark:text-slate-400 hover:text-sky-900 transition-colors" href="#">Planos</a>
        <a class="font-manrope font-semibold text-sm text-slate-500 dark:text-slate-400 hover:text-sky-900 transition-colors" href="#">Segurança</a>
      </div>
      <div class="flex items-center gap-4">
        <router-link to="/login" class="px-5 py-2 font-manrope font-semibold text-sm text-primary hover:bg-surface-container-high transition-all rounded-xl text-sky-900 dark:text-sky-300">Entrar</router-link>
        <router-link to="/register" class="px-6 py-2 bg-sky-900 dark:bg-sky-700 text-white font-manrope font-bold text-sm rounded-xl shadow-lg shadow-sky-900/10 active:scale-95 transition-transform">Registrar Condomínio</router-link>
      </div>
    </nav>
    <div class="bg-slate-200/50 dark:bg-slate-800/50 h-[1px]"></div>
  </header>
</template>

<script setup lang="ts">
// Navigation logic if needed
</script>

<style scoped>
.font-manrope { font-family: 'Manrope', sans-serif; }
</style>
