<template>
  <div class="flex min-h-screen bg-surface text-on-surface">
    <!-- SideNavBar -->
    <SideNavBar 
      role="ADMIN" 
      :userName="userName"
      @logout="handleLogout"
      :class="['transition-transform', sidebarOpen ? 'translate-x-0' : '-translate-x-full', 'fixed md:relative z-50 md:translate-x-0']" 
    />

    <!-- Main Content Area -->
    <main class="flex-1 flex flex-col min-h-screen w-full">
      <TopAppBar 
        :userName="userName" 
        userRole="ADMIN"
        @toggle-sidebar="sidebarOpen = !sidebarOpen" 
      />

      <div class="flex-1 p-4 md:p-6 lg:p-8 flex flex-col items-center justify-center text-center">
        <div class="w-20 h-20 bg-sky-100 rounded-full flex items-center justify-center mb-6">
          <span class="material-symbols-outlined text-4xl text-sky-500">construction</span>
        </div>
        <h1 class="text-2xl font-bold text-cyan-900 mb-2">Áreas Comuns</h1>
        <p class="text-slate-500 max-w-md mb-2">Esta funcionalidade está em desenvolvimento.</p>
        <span class="inline-flex items-center gap-1 px-3 py-1 bg-sky-50 text-sky-700 rounded-full text-sm font-medium">US04 - Gerenciamento de áreas comuns</span>
      </div>
    </main>

    <!-- Mobile Overlay -->
    <div 
      v-if="sidebarOpen" 
      class="fixed inset-0 bg-black/50 z-40 md:hidden"
      @click="sidebarOpen = false"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import SideNavBar from '@/modules/shared/components/SideNavBar.vue'
import TopAppBar from '@/modules/shared/components/TopAppBar.vue'
import { authService } from '@/modules/auth/services/auth.service'
import { http } from '@/api/http'

const router = useRouter()
const sidebarOpen = ref(false)

const user = authService.getUser()
const userName = ref(user?.name || '')

const handleLogout = async () => {
  try {
    await http.post('/auth/logout')
  } catch { /* ignora */ }
  authService.logout()
  router.push('/')
}

router.afterEach(() => {
  sidebarOpen.value = false
})
</script>