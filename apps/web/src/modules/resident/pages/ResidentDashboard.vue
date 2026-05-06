<template>
  <div class="flex min-h-screen bg-surface text-on-surface">
    <!-- SideNavBar -->
    <SideNavBar 
      role="RESIDENT" 
      :userName="userName"
      @logout="handleLogout"
      :class="['transition-transform', sidebarOpen ? 'translate-x-0' : '-translate-x-full', 'fixed md:relative z-50 md:translate-x-0']" 
    />

    <!-- Main Content Area -->
    <main class="flex-1 flex flex-col min-h-screen w-full">
      <TopAppBar 
        :userName="userName" 
        userRole="RESIDENT"
        @toggle-sidebar="sidebarOpen = !sidebarOpen" 
      />

      <!-- Dashboard Content -->
      <div class="flex-1 p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8 lg:space-y-12 w-full max-w-full">
        <!-- Condominium Name Banner -->
        <div class="bg-gradient-to-r from-cyan-700 to-cyan-900 rounded-2xl p-6 text-white">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <span class="material-symbols-outlined text-2xl">apartment</span>
            </div>
            <div>
              <p class="text-sm text-white/70">Condomínio</p>
              <h1 class="text-xl md:text-2xl font-bold">{{ condominiumName }}</h1>
            </div>
          </div>
        </div>

        <!-- Welcome Section -->
        <WelcomeSection 
          :title="`Olá, ${userName}!`" 
          :description="welcomeMessage" 
        />

        <!-- Stats Cards - Simplificado para Resident -->
        <!-- WelcomeSection (reutilizável) -->
        <WelcomeSection 
          :title="`Olá, ${userName}!`" 
          :description="welcomeMessage" 
        />

        <!-- Stats Cards - Simplificado para Resident -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatsCard title="Minhas Reservas" :value="2" icon="event_available" trend="Próximas" variant="primary" />
          <StatsCard title="Áreas Disponíveis" :value="5" icon="pool" variant="primary" />
        </div>

        <!-- Main Grid Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          <!-- Left Column: My Reservations -->
          <div class="col-span-1 lg:col-span-7 space-y-4 md:space-y-6">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-lg md:text-xl font-bold text-cyan-900 tracking-tight">Minhas Próximas Reservas</h3>
              <router-link to="/resident/reservations" class="text-sm font-semibold text-primary hover:underline">Ver todas</router-link>
            </div>
            
            <div class="space-y-3 md:space-y-4">
              <ReservationItem 
                title="Churrasqueira" 
                schedule="Sáb, 14:00 - 18:00" 
                resident="Você" 
                status="Confirmado" 
                icon="outdoor_grill"
              />
              <ReservationItem 
                title="Salão de Festas" 
                schedule="Dom, 19:00 - 23:00" 
                resident="Você" 
                status="Pendente" 
                icon="celebration"
              />
            </div>
          </div>

          <!-- Right Column -->
          <div class="col-span-1 lg:col-span-5 space-y-6 md:space-y-8">
            <!-- Quick Actions -->
            <QuickActions :actions="quickActions" @action="handleQuickAction" />
            
            <!-- Áreas Comuns Disponíveis -->
            <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h3 class="text-lg md:text-xl font-bold text-cyan-900 tracking-tight mb-4">Áreas Comuns</h3>
              <div class="space-y-3">
                <router-link to="/resident/common-areas" class="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span class="material-symbols-outlined text-primary">pool</span>
                  </div>
                  <div class="flex-1">
                    <p class="font-semibold text-cyan-900">Piscina</p>
                    <p class="text-sm text-slate-500">09:00 - 21:00</p>
                  </div>
                </router-link>
                <router-link to="/resident/common-areas" class="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span class="material-symbols-outlined text-primary">outdoor_grill</span>
                  </div>
                  <div class="flex-1">
                    <p class="font-semibold text-cyan-900">Churrasqueira</p>
                    <p class="text-sm text-slate-500">10:00 - 22:00</p>
                  </div>
                </router-link>
                <router-link to="/resident/common-areas" class="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span class="material-symbols-outlined text-primary">celebration</span>
                  </div>
                  <div class="flex-1">
                    <p class="font-semibold text-cyan-900">Salão de Festas</p>
                    <p class="text-sm text-slate-500">08:00 - 23:00</p>
                  </div>
                </router-link>
              </div>
            </div>
          </div>
        </div>
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import SideNavBar from '@/modules/shared/components/SideNavBar.vue'
import TopAppBar from '@/modules/shared/components/TopAppBar.vue'
import WelcomeSection from '@/modules/shared/components/WelcomeSection.vue'
import StatsCard from '@/modules/dashboard/components/StatsCard.vue'
import ReservationItem from '@/modules/dashboard/components/ReservationItem.vue'
import QuickActions from '@/modules/dashboard/components/QuickActions.vue'
import { authService } from '@/modules/auth/services/auth.service'
import { http } from '@/api/http'

const router = useRouter()
const sidebarOpen = ref(false)

const user = authService.getUser()
const userName = ref(user?.name || 'Morador')

const condoData = JSON.parse(localStorage.getItem('auth_condo') || '{}')
const condominiumName = ref(condoData.name || '')

const welcomeMessage = computed(() => `Aqui está o resumo das suas reservas no ${condominiumName.value || 'Condomínio'} hoje.`)

const quickActions = [
  { id: 'new-reservation', label: 'Nova Reserva', icon: 'add_circle', primary: true },
  { id: 'my-areas', label: 'Ver Áreas', icon: 'pool', primary: false },
]

const handleLogout = async () => {
  try {
    await http.post('/auth/logout')
  } catch { /* ignora */ }
  authService.logout()
  router.push('/')
}

const handleQuickAction = (actionId: string) => {
  if (actionId === 'new-reservation') {
    router.push('/resident/reservations')
  } else if (actionId === 'my-areas') {
    router.push('/resident/common-areas')
  }
}

router.afterEach(() => {
  sidebarOpen.value = false
})
</script>

<style scoped>
.font-headline { font-family: 'Manrope', sans-serif; }
.font-body { font-family: 'Inter', sans-serif; }
.material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
.signature-gradient { background: linear-gradient(135deg, #004d75 0%, #006699 100%); }
</style>