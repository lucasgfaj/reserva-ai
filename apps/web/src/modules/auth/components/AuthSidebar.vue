<template>
  <section class="flex flex-col justify-center p-12 md:p-16 lg:p-20 w-full h-full signature-gradient relative overflow-hidden">
    <!-- Background Image Overlay -->
    <div class="absolute inset-0 opacity-20 pointer-events-none">
      <img 
        :src="bgImage" 
        class="w-full h-full object-cover mix-blend-overlay" 
        alt="Background Texture"
      />
    </div>

    <div class="relative z-10 max-w-xl">
      <!-- Logo/Brand -->
      <div class="mb-12">
        <h1 class="font-headline font-extrabold text-white text-5xl tracking-tight mb-4">Reserva Aí!</h1>
        <div class="h-1 w-24 bg-tertiary-fixed rounded-full"></div>
      </div>

      <!-- Main Catchphrase -->
      <h2 class="font-headline font-bold text-on-primary-container text-4xl leading-tight mb-8">
        {{ title }}
      </h2>
      
      <!-- Features List -->
      <div v-if="features" class="space-y-6">
        <div v-for="feature in features" :key="feature.title" class="flex items-start gap-4">
          <div class="bg-white/10 p-2 rounded-lg backdrop-blur-md flex-shrink-0">
            <span class="material-symbols-outlined text-tertiary-fixed">{{ feature.icon }}</span>
          </div>
          <div>
            <h3 class="font-headline font-semibold text-white text-xl">{{ feature.title }}</h3>
            <p class="text-on-primary-container/80 text-sm">{{ feature.description }}</p>
          </div>
        </div>
      </div>

      <!-- Social Proof (Optional) -->
      <div v-if="showProof && !features" class="mt-8 flex items-center gap-4">
        <div class="flex -space-x-3">
          <img class="avatar !border-primary" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB4fWrjdAHzOHvNtbgAUssMx_1LKRIpnBHDXia-8pBxFEQOyMdO2eaG8lNsCI7DNpGJ-UpE7IXoG1d-8kD5P2s5BYkuIrAahAN27Cyy2UraRgQtcwSjrGyY8Kso16VGeVhwAzn577Vk0peHMofGdE7cb5GhiaPjePr_nV5Fizb1cXgalQHOxaqke7-SvCiNsYmRiolYZYW16trpIohYuT4tshvYa62MoGgHUcYCDXNgub871kEauEwkzQPzTV11i5s0GjhZVMhr7mZ-" alt="Resident 1" />
          <img class="avatar !border-primary" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC4R_aPzCH_fmJLrQits6m2wpY7wlwPXq6HHzzyopYBndWF62AVw2cHrBUwG5e7Sy8iswZdW_DEmCtCnpzcYl0cmUvJdpAudjfqJ4snC7B-xww9TAmw2Hh7vVJ72o6Fy8fi59yuwmN9vqDsGWOXvjBm9t_as-l4NPg64BtGB_1So_g2XfhmQpyAKpHhbyVlnSsPMhNt1D3-0fAQcoFFsf_nWoexWYHubxISKXTq0hKD3AHC4q4lNfG6I4OIpxdjr_s4BgQ5YWRjhhUH" alt="Resident 2" />
        </div>
        <span class="text-white/80 text-sm font-medium">+500 moradores ativos</span>
      </div>

      <!-- Trust Badges -->
      <div class="mt-16 pt-8 border-t border-white/10 flex items-center gap-8">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-white/50 text-base">lock</span>
          <span class="text-white/70 text-xs font-medium tracking-wider uppercase">SSL Secure</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-white/50 text-base">policy</span>
          <span class="text-white/70 text-xs font-medium tracking-wider uppercase">LGPD Compliant</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  bgImage: string
  features?: Array<{ title: string; description: string; icon: string }>
  showProof?: boolean
}>()
</script>
