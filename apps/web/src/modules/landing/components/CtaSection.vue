<template>
  <section id="register" class="py-24 px-6 max-w-7xl mx-auto text-center">
    <div class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[3rem] p-12 lg:p-20 shadow-2xl shadow-sky-900/5 relative overflow-hidden">
      <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-sky-400 via-sky-600 to-sky-900"></div>
      
      <h2 class="font-manrope font-extrabold text-4xl lg:text-5xl text-sky-900 dark:text-sky-300 mb-6 tracking-tight">
        Pronto para modernizar sua gestão?
      </h2>
      
      <p class="text-slate-600 dark:text-slate-400 text-lg lg:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
        Código aberto, gratuito e autogerenciável. Sem taxas, sem surpresas, sem vínculo.
      </p>
      
      <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
        <router-link to="/register" class="w-full sm:w-auto px-10 py-4 bg-sky-900 dark:bg-sky-700 text-white font-manrope font-bold text-lg rounded-2xl shadow-xl shadow-sky-900/20 active:scale-95 transition-transform flex justify-center items-center">
          Começar agora
        </router-link>
      </div>
      
      <p class="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-widest">
        Open source • Autogerenciável • Sem vínculo contratual
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
// Components or logic can be added here
</script>

<style scoped>
.font-manrope { font-family: 'Manrope', sans-serif; }
</style>
