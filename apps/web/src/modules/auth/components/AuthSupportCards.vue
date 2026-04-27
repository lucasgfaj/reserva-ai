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

    <div class="p-5 rounded-2xl bg-surface-container-low border border-outline-variant flex items-center gap-4 group cursor-pointer hover:bg-surface-container transition-all">
      <div class="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-all">
        <span class="material-symbols-outlined">contact_support</span>
      </div>
      <div class="flex-1">
        <h4 class="text-sm font-bold text-on-surface">Não tem acesso?</h4>
        <p class="text-xs text-on-surface-variant">Entre em contato com o síndico ou administração.</p>
      </div>
      <span class="text-primary font-bold text-xs hover:underline">Falar com Adm</span>
    </div>
  </div>
</template>
