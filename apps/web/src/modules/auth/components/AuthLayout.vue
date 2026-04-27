<template>
  <main class="min-h-screen bg-surface flex flex-col md:flex-row relative overflow-hidden font-body">
    <!-- Floating Background Details for Texture -->
    <div class="fixed top-20 right-[-100px] w-[500px] h-[500px] bg-secondary-fixed/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
    <div class="fixed bottom-[-100px] left-[-100px] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[80px] -z-10 pointer-events-none"></div>

    <!-- Sidebar Section (Blue Part) -->
    <div class="hidden md:flex w-1/2 min-h-screen relative z-10 shadow-premium">
      <slot name="sidebar"></slot>
    </div>

    <!-- Form Section -->
    <section class="flex-1 min-h-screen bg-surface-container-lowest relative z-20 flex flex-col items-center justify-center p-6 sm:p-12 md:p-20 overflow-y-auto">
      <div class="w-full max-w-md py-12">
        <!-- Back Button -->
        <div class="mb-10">
          <AuthBackButton />
        </div>

        <slot></slot>
      </div>
    </section>

    <!-- Footer Meta -->
    <footer class="fixed bottom-6 right-8 text-on-surface-variant/40 text-[10px] uppercase tracking-[0.2em] font-medium hidden lg:block pointer-events-none">
      © 2024 Reserva Aí! • Tecnologia para Condomínios de Alto Padrão
    </footer>
  </main>
</template>

<script setup lang="ts">
import AuthBackButton from './AuthBackButton.vue'
</script>

<style scoped>
/* Ensure smooth scrolling for the form container */
section::-webkit-scrollbar {
  width: 6px;
}
section::-webkit-scrollbar-track {
  background: transparent;
}
section::-webkit-scrollbar-thumb {
  background: rgba(0, 77, 117, 0.1);
  border-radius: 10px;
}
</style>
