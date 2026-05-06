<template>
  <header class="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-xl shadow-sm shadow-cyan-900/5 px-4 md:px-8 lg:px-12 py-4 md:py-6 flex justify-between items-center">
    <!-- Mobile: Hamburger button -->
    <button 
      @click="$emit('toggle-sidebar')" 
      class="md:hidden p-2 -ml-2 text-slate-600 hover:text-cyan-900 transition-colors"
    >
      <span class="material-symbols-outlined text-2xl">menu</span>
    </button>

    <!-- Spacer for mobile (when hamburger is shown) -->
    <div class="w-10 md:hidden"></div>

    <!-- Search - hidden on mobile -->
    <div class="hidden md:flex items-center gap-6 flex-1">
      <div class="relative w-full max-w-md focus-within:ring-2 focus-within:ring-cyan-500/20 rounded-xl transition-all">
        <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
        <input 
          class="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border-none rounded-xl text-sm focus:ring-0 placeholder:text-slate-400" 
          placeholder="Pesquisar..." 
          type="text"
        />
      </div>
    </div>

    <!-- Right side -->
    <div class="flex items-center gap-4 md:gap-6">
      <!-- Mobile: Search icon -->
      <button class="md:hidden p-2 text-slate-400 hover:text-cyan-900 transition-colors relative">
        <span class="material-symbols-outlined">search</span>
      </button>

      <div class="flex items-center gap-2 md:gap-4">
        <button class="p-2 text-slate-400 hover:text-cyan-900 transition-colors relative hidden sm:block">
          <span class="material-symbols-outlined">notifications</span>
          <span class="absolute top-1 right-1 w-2 h-2 bg-error rounded-full border-2 border-white"></span>
        </button>
        <button class="p-2 text-slate-400 hover:text-cyan-900 transition-colors hidden sm:block">
          <span class="material-symbols-outlined">chat_bubble</span>
        </button>
      </div>

      <!-- User profile -->
      <div class="flex items-center gap-2 md:gap-3 pl-2 md:pl-6 border-l border-slate-100">
        <div class="text-right hidden sm:block">
          <p class="text-sm font-bold text-cyan-900 leading-none">{{ userName || 'Usuário' }}</p>
          <p class="text-[11px] text-slate-400 mt-1">{{ roleLabel }}</p>
        </div>
        <div class="w-9 h-9 md:w-10 md:h-10 rounded-full bg-primary flex items-center justify-center text-white ring-2 ring-surface-container font-bold text-sm md:text-base">
          {{ userName ? userName.charAt(0).toUpperCase() : 'U' }}
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  userName?: string
  userRole?: string
}>(), {
  userName: '',
  userRole: 'ADMIN'
})

defineEmits<{
  'toggle-sidebar': []
}>()

const roleLabel = computed(() => {
  const labels: Record<string, string> = {
    ADMIN: 'Administrador',
    RESIDENT: 'Morador',
    SUPER_ADMIN: 'Super Admin'
  }
  return labels[props.userRole] || 'Usuário'
})
</script>

<style scoped>
.material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>