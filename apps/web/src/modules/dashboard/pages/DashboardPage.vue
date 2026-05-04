<template>
  <div class="flex min-h-screen bg-surface text-on-surface">
    <!-- SideNavBar -->
    <SideNavBar @logout="handleLogout" :class="['transition-transform', sidebarOpen ? 'translate-x-0' : '-translate-x-full', 'fixed md:relative z-50 md:translate-x-0']" />

    <!-- Main Content Area -->
    <main class="flex-1 flex flex-col min-h-screen w-full">
      <!-- TopAppBar -->
      <TopAppBar @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <!-- Dashboard Content -->
      <div class="flex-1 p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8 lg:space-y-12 w-full max-w-full">
        <!-- Welcome Section -->
        <WelcomeSection 
          title="Dashboard Principal" 
          :description="welcomeMessage" 
        />

        <!-- Stats Cards - RESPONSIVE -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatsCard title="Reservas Pendentes" :value="8" icon="pending_actions" trend="+12%" variant="primary" />
          <StatsCard title="Total de Moradores" :value="412" icon="group" subtitle="120 unidades ocupadas" variant="primary" />
          <StatsCard title="Ocupação de Áreas" :value="'84.2%'" icon="analytics" variant="primary">
            <template #progress>
              <div class="w-full bg-surface-container-high h-1.5 rounded-full mt-3 md:mt-5">
                <div class="bg-tertiary h-full rounded-full" style="width: 84.2%"></div>
              </div>
            </template>
          </StatsCard>
          <StatsCard title="Avisos Ativos" :value="3" icon="campaign" trend="1 crítico" variant="error" />
        </div>

        <!-- Main Grid Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          <!-- Left Column: Reservations -->
          <div class="col-span-1 lg:col-span-7 space-y-4 md:space-y-6">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-lg md:text-xl font-bold text-cyan-900 tracking-tight">Próximas Reservas</h3>
              <button class="text-sm font-semibold text-primary hover:underline">Ver calendário completo</button>
            </div>
            
            <div class="space-y-3 md:space-y-4">
              <ReservationItem 
                title="Salão de Festas" 
                schedule="Hoje, 18:00 - 23:00" 
                resident="Carlos Magno (Ap. 142)" 
                status="Confirmado" 
                icon="celebration"
              />
              <ReservationItem 
                title="Espaço Gourmet" 
                schedule="Amanhã, 12:00 - 16:00" 
                resident="Ana Luiza (Ap. 12)" 
                status="Pendente" 
                icon="restaurant"
              />
              <ReservationItem 
                title="Piscina Privativa" 
                schedule="Sáb, 09:00 - 13:00" 
                resident="Roberto Silva (Ap. 205)" 
                status="Confirmado" 
                icon="pool"
              />
            </div>
          </div>

          <!-- Right Column -->
          <div class="col-span-1 lg:col-span-5 space-y-6 md:space-y-8">
            <!-- Quick Actions -->
            <QuickActions :actions="quickActions" @action="handleQuickAction" />

            <!-- Recent Activities -->
            <ActivityFeed :activities="activities" />
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
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import SideNavBar from '@/modules/dashboard/components/SideNavBar.vue'
import TopAppBar from '@/modules/dashboard/components/TopAppBar.vue'
import StatsCard from '@/modules/dashboard/components/StatsCard.vue'
import ReservationItem from '@/modules/dashboard/components/ReservationItem.vue'
import QuickActions from '@/modules/dashboard/components/QuickActions.vue'
import ActivityFeed from '@/modules/dashboard/components/ActivityFeed.vue'
import WelcomeSection from '@/modules/dashboard/components/WelcomeSection.vue'
import { authService } from '@/modules/auth/services/auth.service'
import { http } from '@/api/http'

const router = useRouter()
const sidebarOpen = ref(false)
const userName = ref('')
const condominiumName = ref('')

const welcomeMessage = computed(() => `Bem-vindo de volta! Aqui está o resumo das atividades do ${condominiumName.value || 'Condomínio Mirante das Flores'} hoje.`)

const quickActions = [
  { id: 'new-communication', label: 'Novo Comunicado Geral', icon: 'campaign', primary: true },
  { id: 'report', label: 'Gerar Relatório de Ocupação', icon: 'description', primary: false },
]

const activities = [
  {
    id: '1',
    label: 'Comunicado enviado',
    description: 'Manutenção programada dos elevadores agendada para 15/10.',
    time: 'há 2 horas',
    icon: 'mail',
    iconClass: 'text-tertiary',
    iconBgClass: 'bg-tertiary/10',
  },
  {
    id: '2',
    label: 'Novo morador',
    description: 'Marina Albuquerque foi cadastrada no Ap. 302, Bloco B.',
    time: 'há 5 horas',
    icon: 'person_add',
    iconClass: 'text-secondary',
    iconBgClass: 'bg-secondary-container/20',
  },
  {
    id: '3',
    label: 'Ocorrência registrada',
    description: 'Vazamento reportado na área comum da churrasqueira.',
    time: 'Ontem',
    icon: 'report_problem',
    iconClass: 'text-error',
    iconBgClass: 'bg-error/10',
  },
]

onMounted(() => {
  const user = authService.getUser()
  const condo = localStorage.getItem('auth_condo')
  
  if (user) {
    userName.value = user.name
  }
  
  if (condo) {
    const condoData = JSON.parse(condo)
    condominiumName.value = condoData.name
  }
})

const handleLogout = async () => {
  try {
    await http.post('/auth/logout')
  } catch {
    // Ignora erro
  }
  
  authService.logout()
  router.push('/')
}

const handleQuickAction = (actionId: string) => {
  console.log('Quick action:', actionId)
}

// Close sidebar on route change
router.afterEach(() => {
  sidebarOpen.value = false
})
</script>

<style scoped>
.font-headline { font-family: 'Manrope', sans-serif; }
.font-body { font-family: 'Inter', sans-serif; }
.material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
.signature-gradient { background: linear-gradient(135deg, #004d75 0%, #006699 100%); }
</style>