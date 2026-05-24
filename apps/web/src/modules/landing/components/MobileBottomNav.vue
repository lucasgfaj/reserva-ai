<template>
  <nav class="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pt-3 pb-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-t-3xl z-50 border-t border-slate-100 dark:border-slate-800 shadow-[0_-8px_30px_rgba(0,77,117,0.05)]">
    <div class="flex flex-col items-center justify-center text-sky-900 dark:text-sky-300 font-bold bg-sky-50 dark:bg-sky-900/30 rounded-xl px-3 py-1 cursor-pointer">
      <span class="material-symbols-outlined">dashboard</span>
      <span class="font-manrope text-[10px] font-bold tracking-wide uppercase">Início</span>
    </div>
    <a href="#register" class="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 hover:text-sky-700 dark:hover:text-sky-200 transition-transform active:scale-90 cursor-pointer">
      <span class="material-symbols-outlined">how_to_reg</span>
      <span class="font-manrope text-[10px] font-bold tracking-wide uppercase">Registrar</span>
    </a>
    <router-link to="/login" class="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 hover:text-sky-700 dark:hover:text-sky-200 transition-transform active:scale-90 cursor-pointer">
      <span class="material-symbols-outlined">login</span>
      <span class="font-manrope text-[10px] font-bold tracking-wide uppercase">Login</span>
    </router-link>
  </nav>
</template>

<script setup lang="ts">
</script>

<style scoped>
.font-manrope { font-family: 'Manrope', sans-serif; }
.material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
</style>
