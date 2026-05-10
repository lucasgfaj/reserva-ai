<template>
  <aside :class="[
    'h-screen w-72 flex flex-col bg-slate-50 font-headline font-semibold tracking-tight text-sm border-r border-slate-100',
    'fixed md:relative z-50 md:translate-x-0',
    'transition-transform duration-300'
  ]">
    <div class="flex flex-col h-full py-6 md:py-8">
      <!-- Brand Identity -->
      <div class="px-6 md:px-8 mb-8 md:mb-10 flex items-center gap-3">
        <router-link :to="dashboardPath" class="flex items-center gap-3">
          <div class="w-10 h-10 signature-gradient rounded-xl flex items-center justify-center text-white">
            <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">apartment</span>
          </div>
          <div>
            <h1 class="text-2xl font-black text-cyan-900 tracking-tighter leading-none">Reserva Aí!</h1>
            <p class="text-[10px] uppercase tracking-[0.2em] text-slate-400 mt-1">{{ roleLabel }}</p>
          </div>
        </router-link>
      </div>
      
      <!-- Navigation Tabs -->
      <nav class="flex-1 space-y-1 px-4 md:px-6">
        <router-link 
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path" 
          :class="getNavLinkClass(item.path)"
          @click="$emit('link-click')"
        >
          <span class="material-symbols-outlined">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </router-link>
      </nav>
      
      <!-- CTA -->
      <div class="px-6 md:px-8 mt-6">
        <button 
          @click="$emit('cta-click', ctaActionId)"
          class="w-full signature-gradient text-white rounded-xl py-3 px-4 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity"
        >
          <span class="material-symbols-outlined text-sm">{{ ctaIcon }}</span>
          <span>{{ ctaLabel }}</span>
        </button>
      </div>
      
      <!-- Footer Nav -->
      <div class="mt-auto border-t border-slate-100 pt-4 md:pt-6 space-y-1 px-4 md:px-6">
        <a href="#" :class="getNavLinkClass('')">
          <span class="material-symbols-outlined">help_outline</span>
          <span>Ajuda</span>
        </a>
        <a @click="$emit('logout')" class="flex items-center gap-4 text-error px-4 md:px-6 py-3 hover:bg-error/5 transition-colors duration-200 cursor-pointer">
          <span class="material-symbols-outlined">logout</span>
          <span>Sair</span>
        </a>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { menuConfig, roleConfig, type UserRole } from '../config/menuConfig'

const props = defineProps<{
  role: UserRole
  userName?: string
}>()

defineEmits<{
  logout: []
  'link-click': []
  'cta-click': [actionId: string]
}>()

const route = useRoute()

const menuItems = computed(() => menuConfig[props.role] || menuConfig.ADMIN)
const roleLabel = computed(() => roleConfig[props.role]?.subtitle || 'Menu')
const ctaLabel = computed(() => roleConfig[props.role]?.ctaLabel || '')
const ctaIcon = computed(() => roleConfig[props.role]?.ctaIcon || 'add')
const dashboardPath = computed(() => props.role === 'ADMIN' ? '/admin/dashboard' : '/resident/dashboard')
const ctaActionId = computed(() => props.role === 'ADMIN' ? 'admin-cta' : 'resident-cta')

const isActiveRoute = (path: string) => route.path === path || route.path.startsWith(path + '/')

const getNavLinkClass = (path: string) => {
  if (!path) {
    return 'flex items-center gap-4 text-slate-500 px-4 md:px-6 py-3 hover:text-cyan-700 transition-colors duration-200 cursor-pointer rounded-l-full'
  }
  const isActive = isActiveRoute(path)
  return isActive
    ? 'flex items-center gap-4 text-cyan-900 font-bold bg-white rounded-l-full ml-0 md:ml-0 pl-4 py-3 transition-all shadow-sm border border-r-0 border-slate-100'
    : 'flex items-center gap-4 text-slate-500 px-4 md:px-6 py-3 hover:text-cyan-700 transition-colors duration-200 rounded-l-full'
}
</script>

<style scoped>
.font-headline { font-family: 'Manrope', sans-serif; }
.signature-gradient { background: linear-gradient(135deg, #004d75 0%, #006699 100%); }
.material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>