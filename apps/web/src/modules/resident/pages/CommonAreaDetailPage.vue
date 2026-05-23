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

      <div class="flex-1 p-4 md:p-6 lg:p-8 w-full max-w-full">
        <!-- Breadcrumb -->
        <nav class="flex items-center gap-1 md:gap-2 text-sm text-slate-500 mb-4 md:mb-6 lg:mb-8 overflow-x-auto">
          <router-link to="/resident/common-areas" class="hover:text-primary transition-colors whitespace-nowrap">
            Áreas Comuns
          </router-link>
          <span class="material-symbols-outlined text-base md:text-lg">chevron_right</span>
          <span class="text-slate-900 font-medium whitespace-nowrap">{{ area?.name || 'Detalhes' }}</span>
        </nav>

        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center py-12 md:py-20">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>

        <!-- Content -->
        <div v-else-if="area" class="w-full max-w-4xl mx-auto space-y-4 md:space-y-6 lg:space-y-8">
          <!-- Header -->
          <div class="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div class="flex items-center gap-4 md:gap-6">
              <div class="w-14 h-14 md:w-16 lg:w-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <span class="material-symbols-outlined text-3xl md:text-4xl">{{ area.icon || getAreaIcon(area.name) }}</span>
              </div>
              <div>
                <div class="flex items-center gap-3 flex-wrap">
                  <h1 class="text-xl md:text-2xl lg:text-3xl font-bold text-cyan-900">{{ area.name }}</h1>
                  <span
                    v-if="area.isUnderMaintenance"
                    class="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-medium"
                  >
                    Em manutenção
                  </span>
                </div>
                <p v-if="area.description" class="text-slate-500 mt-1 text-sm md:text-base max-w-lg">
                  {{ area.description }}
                </p>
              </div>
            </div>
            <div class="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                @click="goBack"
                class="flex-1 sm:flex-none px-4 md:px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors text-sm md:text-base"
              >
                Voltar
              </button>
            </div>
          </div>

          <!-- Info Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <!-- Schedule Card -->
            <div class="bg-surface-container-lowest rounded-2xl md:rounded-3xl p-4 md:p-6 lg:p-8 border border-slate-100">
              <div class="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                <span class="material-symbols-outlined text-slate-400">schedule</span>
                <h3 class="text-base md:text-lg font-semibold text-cyan-900">Horário de Funcionamento</h3>
              </div>
              <div class="space-y-4">
                <div class="flex items-center gap-3">
                  <span class="material-symbols-outlined text-slate-400">access_time</span>
                  <div>
                    <p class="text-sm text-slate-500">Horário</p>
                    <p class="font-medium text-cyan-900">{{ area.openTime }} - {{ area.closeTime }}</p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <span class="material-symbols-outlined text-slate-400 mt-0.5">calendar_view_week</span>
                  <div>
                    <p class="text-sm text-slate-500 mb-1.5">Dias de funcionamento</p>
                    <div class="flex gap-1.5 flex-wrap">
                      <span
                        v-for="day in getOperatingDaysList(area.operatingDays)"
                        :key="day.value"
                        :class="['w-8 h-8 rounded-full text-xs font-medium flex items-center justify-center', day.active ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-300']"
                        :title="day.label"
                      >
                        {{ day.label[0] }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Capacity & Approval Card -->
            <div class="bg-surface-container-lowest rounded-2xl md:rounded-3xl p-4 md:p-6 lg:p-8 border border-slate-100">
              <div class="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                <span class="material-symbols-outlined text-slate-400">info</span>
                <h3 class="text-base md:text-lg font-semibold text-cyan-900">Informações</h3>
              </div>
              <div class="space-y-4">
                <div class="flex items-center gap-3">
                  <span class="material-symbols-outlined text-slate-400">group</span>
                  <div>
                    <p class="text-sm text-slate-500">Capacidade máxima</p>
                    <p class="font-medium text-cyan-900">{{ area.capacity ? `${area.capacity} pessoas` : 'Não definida' }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <span class="material-symbols-outlined text-slate-400">{{ area.requiresApproval ? 'how_to_reg' : 'event_available' }}</span>
                  <div>
                    <p class="text-sm text-slate-500">Aprovação</p>
                    <p class="font-medium text-cyan-900">{{ area.requiresApproval ? 'Requer aprovação do administrador' : 'Reserva livre' }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Maintenance Warning -->
          <div v-if="area.isUnderMaintenance" class="bg-amber-50 border border-amber-200 rounded-2xl md:rounded-3xl p-4 md:p-6 lg:p-8">
            <div class="flex items-start gap-3">
              <span class="material-symbols-outlined text-amber-600">build</span>
              <div>
                <h3 class="font-semibold text-amber-800">Área em manutenção</h3>
                <p class="text-sm text-amber-700 mt-1">Esta área está temporariamente indisponível para reservas. Tente novamente mais tarde.</p>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="flex flex-col sm:flex-row gap-3">
            <router-link
              to="/resident/common-areas"
              class="flex-1 px-6 py-3 border border-slate-200 rounded-xl text-slate-600 font-medium hover:bg-slate-50 transition-colors text-center"
            >
              Voltar para lista
            </router-link>
          </div>
        </div>

        <!-- Not Found -->
        <div v-else class="text-center py-12 md:py-20">
          <span class="material-symbols-outlined text-5xl md:text-6xl text-slate-300">maps_home_work</span>
          <h2 class="text-lg md:text-xl font-bold text-slate-600 mt-4">Área não encontrada</h2>
          <router-link to="/resident/common-areas" class="text-primary hover:underline mt-2 inline-block">
            Voltar para lista
          </router-link>
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
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SideNavBar from '@/modules/shared/components/SideNavBar.vue'
import TopAppBar from '@/modules/shared/components/TopAppBar.vue'
import { authService } from '@/modules/auth/services/auth.service'
import { http } from '@/api/http'
import { useSidebar } from '@/modules/shared/composables/useSidebar'

interface CommonArea {
  id: string
  name: string
  description: string | null
  capacity: number | null
  openTime: string
  closeTime: string
  operatingDays: number[] | string | null
  requiresApproval: boolean
  icon: string | null
  isUnderMaintenance: boolean
  condominiumId: string
  createdAt: string
  updatedAt: string
}

const route = useRoute()
const router = useRouter()
const { sidebarOpen, sidebarCollapsed, toggleCollapse } = useSidebar()

const user = authService.getUser()
const userName = ref(user?.name || '')

const area = ref<CommonArea | null>(null)
const loading = ref(true)

const DAYS_MAP: Record<number, { label: string; value: number }> = {
  1: { label: 'Dom', value: 1 },
  2: { label: 'Seg', value: 2 },
  3: { label: 'Ter', value: 3 },
  4: { label: 'Qua', value: 4 },
  5: { label: 'Qui', value: 5 },
  6: { label: 'Sex', value: 6 },
  7: { label: 'Sáb', value: 7 },
}

function getOperatingDaysList(days: number[] | string | null): { label: string; value: number; active: boolean }[] {
  const activeDays = new Set<number>()
  if (days) {
    if (Array.isArray(days)) {
      const map: Record<number, number> = { 0: 7, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6 }
      days.forEach((d) => activeDays.add(map[d] ?? d))
    } else if (typeof days === 'string') {
      days.split(',').forEach((d) => activeDays.add(Number(d.trim())))
    }
  }
  return [1, 2, 3, 4, 5, 6, 7].map((v) => ({
    ...DAYS_MAP[v],
    active: activeDays.has(v),
  }))
}

function getAreaIcon(name: string): string {
  const lower = name.toLowerCase()
  if (lower.includes('piscina')) return 'pool'
  if (lower.includes('churrasqueira') || lower.includes('churrasco')) return 'outdoor_grill'
  if (lower.includes('salão') || lower.includes('salon') || lower.includes('festa')) return 'celebration'
  if (lower.includes('quadra') || lower.includes('esporte') || lower.includes('ginásio')) return 'sports_tennis'
  if (lower.includes('academia') || lower.includes('ginástica')) return 'fitness_center'
  if (lower.includes('jogos') || lower.includes('game') || lower.includes('play')) return 'sports_esports'
  if (lower.includes('sauna') || lower.includes('spa')) return 'hot_tub'
  if (lower.includes('biblioteca') || lower.includes('leitura')) return 'local_library'
  if (lower.includes('jardim') || lower.includes('garden') || lower.includes('área verde')) return 'park'
  if (lower.includes('cozinha') || lower.includes('gourmet')) return 'kitchen'
  return 'home_work'
}

async function fetchArea() {
  loading.value = true
  try {
    const response = await http.get(`/common-areas/${route.params.id}`)
    area.value = response.data.data as CommonArea
  } catch {
    area.value = null
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/resident/common-areas')
}

const handleLogout = async () => {
  try {
    await http.post('/auth/logout')
  } catch { /* ok */ }
  authService.logout()
  router.push('/')
}

onMounted(() => {
  fetchArea()
})
</script>

<style scoped>
.material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>
