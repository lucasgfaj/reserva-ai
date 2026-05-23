<template>
  <div class="flex min-h-screen bg-surface text-on-surface">
    <SideNavBar 
      role="RESIDENT" 
      :userName="userName"
      :collapsed="sidebarCollapsed"
      @toggle-collapse="toggleCollapse"
      @logout="handleLogout"
      @cta-click="handleQuickAction"
      :class="['transition-transform duration-300', sidebarOpen ? 'translate-x-0' : '-translate-x-full', 'fixed z-50', 'md:translate-x-0']" 
    />
    <main :class="['flex-1 flex flex-col min-h-screen w-full transition-all duration-300', sidebarCollapsed ? 'md:ml-16' : 'md:ml-72']">
      <TopAppBar 
        :userName="userName" 
        userRole="RESIDENT"
        @toggle-sidebar="sidebarOpen = !sidebarOpen" 
      />
      <div class="flex-1 p-4 md:p-6 lg:p-8 flex flex-col items-center justify-center text-center">
        <div class="w-20 h-20 bg-sky-100 rounded-full flex items-center justify-center mb-6">
          <span class="material-symbols-outlined text-4xl text-sky-500">construction</span>
        </div>
        <h1 class="text-2xl font-bold text-cyan-900 mb-2">Disponibilidade</h1>
        <p class="text-slate-500 max-w-md mb-2">Esta funcionalidade está em desenvolvimento.</p>
        <span class="inline-flex items-center gap-1 px-3 py-1 bg-sky-50 text-sky-700 rounded-full text-sm font-medium">US06 - Consultar disponibilidade de áreas</span>
      </div>
    </main>
    <div v-if="sidebarOpen" class="fixed inset-0 bg-black/50 z-40 md:hidden" @click="sidebarOpen = false"></div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import SideNavBar from '@/modules/shared/components/SideNavBar.vue'
import TopAppBar from '@/modules/shared/components/TopAppBar.vue'
import { authService } from '@/modules/auth/services/auth.service'
import { http } from '@/api/http'
import { useSidebar } from '@/modules/shared/composables/useSidebar'
const router = useRouter()
const { sidebarOpen, sidebarCollapsed, toggleCollapse } = useSidebar()
const user = authService.getUser()
const userName = ref(user?.name || '')
const handleQuickAction = () => {}
const handleLogout = async () => {
  try { await http.post('/auth/logout') } catch {}
  authService.logout()
  router.push('/')
}

</script>
