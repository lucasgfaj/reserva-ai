<template>
  <section class="py-24 px-6 max-w-7xl mx-auto">
    <div class="mb-16 text-center max-w-3xl mx-auto">
      <h2 class="font-manrope font-extrabold text-4xl text-sky-900 dark:text-sky-300 mb-4 tracking-tight">Projetado para a harmonia coletiva.</h2>
      <p class="text-slate-600 dark:text-slate-400 text-lg">Deixamos a gestão burocrática no passado para você focar no que importa: a convivência.</p>
    </div>
    <div class="grid md:grid-cols-3 gap-6">
      <!-- Large Bento Item -->
      <div class="md:col-span-2 bg-slate-50 dark:bg-slate-900/50 p-8 lg:p-12 rounded-[2rem] flex flex-col justify-between min-h-[400px] group hover:bg-sky-900 dark:hover:bg-sky-700 transition-colors duration-500">
        <div>
          <div class="w-14 h-14 bg-sky-100 dark:bg-sky-900/50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-sky-800 transition-colors">
            <span class="material-symbols-outlined text-sky-900 dark:text-sky-100 text-3xl">schedule</span>
          </div>
          <h3 class="font-manrope font-bold text-3xl text-sky-900 dark:text-sky-300 mb-4 group-hover:text-white transition-colors">Transparência em Tempo Real</h3>
          <p class="text-slate-600 dark:text-slate-400 text-lg max-w-md group-hover:text-white/80 transition-colors">Agenda compartilhada atualizada instantaneamente. Sem duplicidade de reservas ou discussões sobre horários.</p>
        </div>
        <div class="mt-8"></div>
      </div>
      <!-- Small Bento Item 1 -->
      <div class="bg-slate-50 dark:bg-slate-900/50 p-8 rounded-[2rem] flex flex-col items-start justify-center">
        <div class="w-12 h-12 bg-sky-100 dark:bg-sky-900/50 rounded-2xl flex items-center justify-center mb-6">
          <span class="material-symbols-outlined text-sky-900 dark:text-sky-100 text-2xl">security</span>
        </div>
        <h3 class="font-manrope font-bold text-xl text-sky-900 dark:text-sky-300 mb-3 tracking-tight">Zero Conflitos</h3>
        <p class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">Regras de uso automatizadas por área, garantindo que o regimento interno seja cumprido sem intervenção humana.</p>
      </div>
      <!-- Small Bento Item 2 -->
      <div class="bg-slate-50 dark:bg-slate-900/50 p-8 rounded-[2rem] flex flex-col items-start justify-center">
        <div class="w-12 h-12 bg-sky-100 dark:bg-sky-900/50 rounded-2xl flex items-center justify-center mb-6">
          <span class="material-symbols-outlined text-sky-900 dark:text-sky-100 text-2xl">touch_app</span>
        </div>
        <h3 class="font-manrope font-bold text-xl text-sky-900 dark:text-sky-300 mb-3 tracking-tight">Simplicidade Extrema</h3>
        <p class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">Interface projetada para todas as idades. Reservar uma quadra ou o salão de festas leva menos de 10 segundos.</p>
      </div>
      <!-- Feature Overlay Image Card -->
      <div class="md:col-span-2 relative overflow-hidden rounded-[2rem] h-[400px]">
        <img class="w-full h-full object-cover" data-alt="blurred elegant restaurant interior with modern furniture and soft warm ambient lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBmiXNsC3Ntztws7zV4z2qShAB4gpVHr2t6jpvpUd98wpEB3P1kWD-ZHEhaG_eCcFHqZANAQ1r4QKglgsuDmN4s_X8PxQ5ee2YEz5gvnSiLJGa0xRYF2jF6KaBeQ3f265XcRLADqviPVXoLMFME7xtvYmtI6Mi-aQugEAJPWhJERD3KXaeqj8hMV6ekVVJXjbTootrDAnluU9CH1IPrwkyUrV-KLKP9_RpucND-uaFD3qUemkQoWVFwDm8KrNRApWbuWvHGulkX0RAH"/>
        <div class="absolute inset-0 bg-gradient-to-r from-sky-900/90 to-transparent flex flex-col justify-center p-12">
          <h3 class="font-manrope font-bold text-3xl text-white mb-4">Comunicados Instantâneos</h3>
          <p class="text-white/80 text-lg max-w-sm">A administração envia avisos em tempo real para todos os moradores. Manutenções, eventos e novidades sem papel nem grupos de WhatsApp.</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
</script>

<style scoped>
.font-manrope { font-family: 'Manrope', sans-serif; }
.material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
</style>
