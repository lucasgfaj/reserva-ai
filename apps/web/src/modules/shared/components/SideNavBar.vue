<template>
  <aside :class="[
    'h-screen flex flex-col bg-slate-50 font-headline font-semibold tracking-tight text-sm border-r border-slate-100',
    'fixed z-50',
    'transition-all duration-300',
    collapsed ? 'w-16' : 'w-72',
  ]">
    <div class="flex flex-col h-full py-6 md:py-8 overflow-hidden">
      <!-- Brand Identity -->
      <div :class="collapsed ? 'px-0 flex justify-center mb-8 md:mb-10' : 'px-4 md:px-5 mb-8 md:mb-10 flex items-center gap-3'">
        <router-link :to="dashboardPath" class="flex items-center gap-3 min-w-0">
          <div class="w-10 h-10 signature-gradient rounded-xl flex items-center justify-center text-white flex-shrink-0">
            <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">apartment</span>
          </div>
          <div v-show="!collapsed" class="min-w-0">
            <h1 class="text-xl md:text-2xl font-black text-cyan-900 tracking-tighter leading-tight break-words">{{ condominiumName }}</h1>
            <p class="text-[10px] uppercase tracking-[0.2em] text-slate-400 mt-1 truncate">{{ roleLabel }}</p>
          </div>
        </router-link>
      </div>

      <!-- Navigation Tabs -->
      <nav :class="collapsed ? 'flex-1 flex flex-col items-center space-y-1' : 'flex-1 space-y-1 px-3 md:px-4'">
        <router-link
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          :class="getNavLinkClass(item.path)"
          @click="$emit('link-click')"
        >
          <span class="material-symbols-outlined">{{ item.icon }}</span>
          <span v-show="!collapsed" class="truncate">{{ item.label }}</span>
        </router-link>
      </nav>

      <!-- CTA -->
      <div :class="collapsed ? 'mt-6 flex justify-center' : 'px-3 md:px-4 mt-6'">
        <button
          @click="$emit('cta-click', ctaActionId)"
          :class="[
            'signature-gradient text-white rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity',
            collapsed ? 'p-2 w-10 h-10' : 'py-3 px-4 w-full',
          ]"
        >
          <span class="material-symbols-outlined text-sm">{{ ctaIcon }}</span>
          <span v-show="!collapsed" class="truncate">{{ ctaLabel }}</span>
        </button>
      </div>

      <!-- Footer Nav -->
      <div :class="collapsed ? 'mt-auto border-t border-slate-100 pt-4 md:pt-6 flex flex-col items-center space-y-1' : 'mt-auto border-t border-slate-100 pt-4 md:pt-6 space-y-1 px-3 md:px-4'">
        <router-link :to="helpPath" :class="getFooterLinkClass" @click="$emit('link-click')">
          <span class="material-symbols-outlined">help_outline</span>
          <span v-show="!collapsed">Ajuda</span>
        </router-link>
      </div>

      <!-- Collapse toggle -->
      <div :class="collapsed ? 'pt-2 flex justify-center' : 'px-3 md:px-4 pt-2'">
        <button
          @click="$emit('toggle-collapse')"
          class="flex items-center justify-center gap-2 text-slate-400 hover:text-cyan-700 py-2 rounded-xl hover:bg-slate-100 transition-colors"
          :class="collapsed ? 'w-10 h-10' : 'w-full'"
        >
          <span class="material-symbols-outlined text-lg transition-transform duration-300" :class="collapsed ? 'rotate-180' : ''">
            chevron_left
          </span>
          <span v-show="!collapsed" class="text-xs">Recolher</span>
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { menuConfig, roleConfig, type UserRole } from '../config/menuConfig'
import { authService } from '@/modules/auth/services/auth.service'

const props = defineProps<{
  role: UserRole
  userName?: string
  collapsed?: boolean
}>()

defineEmits<{
  logout: []
  'link-click': []
  'cta-click': [actionId: string]
  'toggle-collapse': []
}>()

const route = useRoute()

const condo = authService.getCondo()
const condominiumName = computed(() => {
  const name = condo?.name || 'Reserva Aí!'
  return name.replace(/^Condom[ií]nio\s+/i, '')
})

const menuItems = computed(() => menuConfig[props.role] || menuConfig.ADMIN)
const roleLabel = computed(() => roleConfig[props.role]?.subtitle || 'Menu')
const ctaLabel = computed(() => roleConfig[props.role]?.ctaLabel || '')
const ctaIcon = computed(() => roleConfig[props.role]?.ctaIcon || 'add')
const dashboardPath = computed(() => props.role === 'ADMIN' ? '/condominium/dashboard' : '/resident/dashboard')
const ctaActionId = computed(() => {
  if (props.role === 'RESIDENT') return 'new-reservation'
  return `${props.role.toLowerCase()}-cta`
})

const helpPath = computed(() => props.role === 'ADMIN' ? '/condominium/help' : '/resident/help')

const isActiveRoute = (path: string) => route.path === path || route.path.startsWith(path + '/')

const getNavLinkClass = (path: string) => {
  if (!path) return ''
  const isActive = isActiveRoute(path)
  if (props.collapsed) {
    return isActive
      ? 'flex items-center justify-center w-10 h-10 rounded-xl text-cyan-900 font-bold bg-white shadow-sm border border-slate-100 transition-all'
      : 'flex items-center justify-center w-10 h-10 rounded-xl text-slate-500 hover:text-cyan-700 hover:bg-slate-100 transition-colors duration-200'
  }
  return isActive
    ? 'flex items-center gap-4 text-cyan-900 font-bold bg-white rounded-l-full py-3 transition-all shadow-sm border border-r-0 border-slate-100 px-4'
    : 'flex items-center gap-4 text-slate-500 py-3 hover:text-cyan-700 transition-colors duration-200 rounded-l-full px-4'
}

const getFooterLinkClass = computed(() =>
  props.collapsed
    ? 'flex items-center justify-center w-10 h-10 rounded-xl text-slate-500 hover:text-cyan-700 hover:bg-slate-100 transition-colors duration-200'
    : 'flex items-center gap-4 text-slate-500 py-3 hover:text-cyan-700 transition-colors duration-200 cursor-pointer rounded-l-full px-4'
)
</script>

<style scoped>
.font-headline { font-family: 'Manrope', sans-serif; }
.signature-gradient { background: linear-gradient(135deg, #004d75 0%, #006699 100%); }
.material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>
