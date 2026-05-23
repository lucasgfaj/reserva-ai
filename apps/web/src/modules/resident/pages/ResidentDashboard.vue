<template>
  <div class="flex min-h-screen bg-surface text-on-surface">
    <SideNavBar
      role="RESIDENT"
      :userName="userName"
      :collapsed="sidebarCollapsed"
      @toggle-collapse="toggleCollapse"
      @logout="handleLogout"
      :class="['transition-transform duration-300', sidebarOpen ? 'translate-x-0' : '-translate-x-full', 'fixed z-50', 'md:translate-x-0']"
    />

    <main :class="['flex-1 flex flex-col min-h-screen w-full transition-all duration-300', sidebarCollapsed ? 'md:ml-16' : 'md:ml-72']">
      <TopAppBar
        :userName="userName"
        userRole="RESIDENT"
        @toggle-sidebar="sidebarOpen = !sidebarOpen"
      />

      <div class="flex-1 p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8 w-full max-w-full">
        <!-- Welcome -->
        <div>
          <h2 class="text-2xl md:text-3xl font-extrabold text-primary tracking-tight">
            Olá, {{ userName }}!
          </h2>
          <p class="text-on-surface-variant mt-1">
            {{ welcomeMessage }}
          </p>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatsCard title="Minhas Reservas" :value="reservationsCount" icon="event_available" trend="Próximas" variant="primary" />
          <StatsCard title="Áreas Disponíveis" :value="commonAreasCount" icon="pool" variant="primary" />
        </div>

        <!-- Main Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          <!-- Left: My Reservations -->
          <div class="col-span-1 lg:col-span-7 space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-bold text-cyan-900">Minhas Próximas Reservas</h3>
              <router-link to="/resident/reservations" class="text-sm font-semibold text-primary hover:underline">
                Ver todas
              </router-link>
            </div>

            <div v-if="reservations.length" class="space-y-3">
              <ReservationItem
                v-for="res in reservations"
                :key="res.id"
                v-bind="res"
              />
            </div>

            <div v-else class="bg-surface-container-lowest rounded-xl p-8 text-center">
              <div class="w-14 h-14 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span class="material-symbols-outlined text-3xl text-sky-500">event_busy</span>
              </div>
              <p class="text-slate-600 font-medium">Nenhuma reserva ativa</p>
              <p class="text-sm text-slate-400 mt-1">Faça sua primeira reserva em uma área comum.</p>
              <router-link
                to="/resident/reservations/new"
                class="inline-flex items-center gap-1.5 mt-4 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:brightness-90 transition-all"
              >
                <span class="material-symbols-outlined text-[18px]">add_circle</span>
                Nova Reserva
              </router-link>
            </div>
          </div>

          <!-- Right: Quick Actions -->
          <div class="col-span-1 lg:col-span-5 space-y-6">
            <QuickActions :actions="quickActions" @action="handleQuickAction" />

            <!-- Link rápido para áreas comuns -->
            <router-link
              to="/resident/common-areas"
              class="block bg-gradient-to-r from-primary/5 to-transparent rounded-xl p-5 border border-primary/10 hover:border-primary/30 transition-colors group"
            >
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <span class="material-symbols-outlined text-primary text-2xl">pool</span>
                </div>
                <div>
                  <p class="font-bold text-cyan-900">Explorar Áreas Comuns</p>
                  <p class="text-sm text-slate-500">{{ commonAreasCount }} área{{ commonAreasCount !== 1 ? 's' : '' }} disponí{{ commonAreasCount !== 1 ? 'veis' : 'vel' }}</p>
                </div>
                <span class="material-symbols-outlined ml-auto text-slate-300 group-hover:text-primary transition-colors">arrow_forward</span>
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </main>

    <div
      v-if="sidebarOpen"
      class="fixed inset-0 bg-black/50 z-40 md:hidden"
      @click="sidebarOpen = false"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import SideNavBar from '@/modules/shared/components/SideNavBar.vue'
import TopAppBar from '@/modules/shared/components/TopAppBar.vue'
import StatsCard from '@/modules/dashboard/components/StatsCard.vue'
import ReservationItem from '@/modules/dashboard/components/ReservationItem.vue'
import QuickActions from '@/modules/dashboard/components/QuickActions.vue'
import { authService } from '@/modules/auth/services/auth.service'
import { http } from '@/api/http'
import { useSidebar } from '@/modules/shared/composables/useSidebar'

interface Reservation {
  id: string
  title: string
  schedule: string
  resident: string
  status: 'Confirmado' | 'Pendente' | 'Cancelado'
  icon: string
}

const router = useRouter()
const { sidebarOpen, sidebarCollapsed, toggleCollapse } = useSidebar()

const user = authService.getUser()
const userName = ref(user?.name || 'Morador')

const commonAreasCount = ref(0)
const reservations = ref<Reservation[]>([])

const reservationsCount = computed(() => reservations.value.length)

const welcomeMessage = computed(() => {
  const count = reservations.value.length
  if (count === 0) return 'Você ainda não tem reservas. Que tal fazer uma agora?'
  if (count === 1) return 'Você tem 1 reserva próxima.'
  return `Você tem ${count} reservas próximas.`
})

const quickActions = [
  { id: 'new-reservation', label: 'Nova Reserva', icon: 'add_circle', primary: true },
  { id: 'my-areas', label: 'Ver Áreas', icon: 'pool', primary: false },
]

async function fetchCommonAreas() {
  try {
    const response = await http.get('/common-areas')
    commonAreasCount.value = response.data.data.total || 0
  } catch {
    commonAreasCount.value = 0
  }
}

const handleLogout = async () => {
  try {
    await http.post('/auth/logout')
  } catch { /* ignora */ }
  authService.logout()
  router.push('/')
}

const handleQuickAction = (actionId: string) => {
  if (actionId === 'new-reservation') {
    router.push('/resident/reservations/new')
  } else if (actionId === 'my-areas') {
    router.push('/resident/common-areas')
  }
}

onMounted(() => {
  fetchCommonAreas()
})
</script>
