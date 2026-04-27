<template>
  <section class="relative px-6 lg:px-12 py-16 lg:py-24 max-w-7xl mx-auto overflow-hidden">
    <div class="grid lg:grid-cols-2 gap-12 items-center">
      <div class="z-10">
        <span class="inline-flex items-center gap-2 px-3 py-1 bg-tertiary-container text-on-tertiary-container rounded-full text-xs font-bold font-manrope uppercase tracking-widest mb-6">
          <span class="material-symbols-outlined text-sm">verified</span> GESTÃO DE ALTO PADRÃO
        </span>
        <h1 class="font-manrope font-extrabold text-5xl lg:text-7xl text-primary leading-tight tracking-tight mb-6">
          A transparência que seu condomínio <span class="text-secondary">merece.</span>
        </h1>
        <p class="text-on-surface-variant text-lg lg:text-xl max-w-lg mb-10 leading-relaxed text-slate-600 dark:text-slate-400">
          Elimine conflitos de agenda, automatize reservas e ofereça uma experiência de concierge digital para seus moradores com a plataforma mais intuitiva do mercado.
        </p>
        <div class="flex flex-wrap gap-4">
          <router-link to="/register" class="px-8 py-4 bg-sky-900 dark:bg-sky-700 text-white font-manrope font-bold text-lg rounded-xl shadow-xl shadow-sky-900/20 active:scale-95 transition-transform flex items-center gap-2">
            Começar agora <span class="material-symbols-outlined">arrow_forward</span>
          </router-link>
          <button class="px-8 py-4 bg-white dark:bg-slate-800 text-sky-900 dark:text-sky-300 font-manrope font-bold text-lg rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm">
            Ver demonstração
          </button>
        </div>
      </div>
      <div class="relative">
        <div class="absolute -top-12 -right-12 w-64 h-64 bg-slate-200/50 dark:bg-slate-800/20 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-12 -left-12 w-64 h-64 bg-sky-100/30 dark:bg-sky-900/10 rounded-full blur-3xl"></div>
        <div class="relative rounded-3xl overflow-hidden shadow-2xl">
          <img class="w-full h-[500px] object-cover" data-alt="luxury modern architectural apartment building with clean lines and large windows at dusk with warm interior lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2q4mgMlKrb5Z6okOic8TrhVyeeinn3yPnCXhJeHiIuFzLRlvRTmg91ZDchqCp8cvStSs0So5bSuqJRjuUedcblu51iJMqS6qjykDV4R2MZKOsaa-xEsXUh8MIDHoPSoO5tDojvdmHHWLfv_3FJcxSfzJmDVAgQDGNVxnFEN2RI7MaOCGiygDJquFZpnvC3H5Xh7wGgbEVXEyLQxRXEE0Te1y1wDEbiOHiKcV5jwiKiCDWMO39I64W9zkto64VWjJvoqvQGckV5I9Q"/>
          <div class="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent"></div>
          <div class="absolute bottom-6 left-6 right-6 glass-panel bg-white/10 p-6 rounded-2xl border border-white/20">
            <div class="flex items-center gap-4">
              <div class="bg-sky-900 p-3 rounded-xl">
                <span class="material-symbols-outlined text-white">event_available</span>
              </div>
              <div>
                <p class="text-white font-manrope font-bold">Reserva Confirmada</p>
                <p class="text-white/80 text-xs">Salão de Festas Gourmet • Hoje, 19:00</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
</script>

<style scoped>
.font-manrope { font-family: 'Manrope', sans-serif; }
.glass-panel { backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
.material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
</style>
