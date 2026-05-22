<template>
  <section class="py-12 bg-slate-50 dark:bg-slate-900/50 overflow-hidden">
    <div class="max-w-7xl mx-auto px-6">
      <p class="text-center font-manrope font-bold text-slate-400 uppercase tracking-widest text-[10px] mb-10">
        Confiado por mais de 500 condomínios premium
      </p>

      <div class="relative w-full overflow-hidden">
        <div class="flex w-max animate-marquee gap-24">
          <!-- Primeira cópia -->
          <span class="logo">SKYLINE</span>
          <span class="logo">PLATINUM</span>
          <span class="logo">RESIDENCE</span>
          <span class="logo">SERENITY</span>
          <span class="logo">HORIZON</span>

          <!-- Duplicado pra loop infinito -->
          <span class="logo">SKYLINE</span>
          <span class="logo">PLATINUM</span>
          <span class="logo">RESIDENCE</span>
          <span class="logo">SERENITY</span>
          <span class="logo">HORIZON</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
</script>

<style scoped>
.font-manrope {
  font-family: 'Manrope', sans-serif;
}

.logo {
  @apply font-manrope font-black text-2xl text-slate-900 dark:text-slate-100 opacity-50 grayscale transition-all;
}

.logo:hover {
  @apply opacity-100 grayscale-0;
}

.animate-marquee {
  animation: marquee 20s linear infinite;
}

@keyframes marquee {
  from {
    transform: translateX(0);
  }

  to {
    transform: translateX(-50%);
  }
}
</style>