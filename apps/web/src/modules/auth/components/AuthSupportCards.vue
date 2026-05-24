<template>
  <div class="mt-12 space-y-4">
    <div class="p-5 rounded-2xl bg-surface-container border border-outline-variant flex items-center justify-between group hover:border-primary/50 transition-all">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
          <span class="material-symbols-outlined">domain</span>
        </div>
        <div>
          <h4 class="text-sm font-bold text-on-surface">Administrador?</h4>
          <p class="text-xs text-on-surface-variant">Comece seu teste grátis</p>
        </div>
      </div>
      <router-link to="/register" class="text-xs font-bold text-primary px-4 py-2 rounded-lg hover:bg-primary/10 transition-colors bg-white shadow-sm border border-outline-variant">
        Registrar
      </router-link>
    </div>


  </div>
</template>
