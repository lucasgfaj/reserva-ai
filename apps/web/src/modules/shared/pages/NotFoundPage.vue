<template>
  <div class="flex min-h-screen bg-surface text-on-surface items-center justify-center p-6">
    <div class="text-center max-w-md">
      <div class="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-8">
        <span class="material-symbols-outlined text-5xl text-slate-400">block</span>
      </div>
      <h1 class="text-4xl font-bold text-slate-800 mb-3">404</h1>
      <p class="text-lg text-slate-500 mb-8">Página não encontrada</p>
      <router-link
        to="/"
        class="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:brightness-90 transition-all font-semibold"
      >
        <span class="material-symbols-outlined text-lg">home</span>
        Voltar ao início
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>
