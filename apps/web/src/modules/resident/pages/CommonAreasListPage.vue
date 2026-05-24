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

      <div class="flex-1 p-4 md:p-6 lg:p-8">
        <!-- Header -->
        <div class="mb-6 md:mb-8">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <span class="material-symbols-outlined text-primary">pool</span>
            </div>
            <h1 class="text-2xl font-bold text-cyan-900">Áreas Comuns</h1>
          </div>
          <p v-if="areas.length" class="text-slate-500 ml-[52px]">
            {{ total }} área{{ total !== 1 ? 's' : '' }} {{ total !== 1 ? 'disponíveis' : 'disponível' }} no condomínio
          </p>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          <div v-for="n in 6" :key="n" class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 animate-pulse">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-12 h-12 bg-slate-200 rounded-xl" />
              <div class="flex-1 space-y-2">
                <div class="h-5 bg-slate-200 rounded w-3/4" />
                <div class="h-4 bg-slate-200 rounded w-1/2" />
              </div>
            </div>
            <div class="space-y-2">
              <div class="h-4 bg-slate-200 rounded w-full" />
              <div class="h-4 bg-slate-200 rounded w-2/3" />
            </div>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="flex flex-col items-center justify-center py-16 text-center">
          <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <span class="material-symbols-outlined text-4xl text-red-500">error_outline</span>
          </div>
          <h2 class="text-xl font-bold text-cyan-900 mb-2">Erro ao carregar</h2>
          <p class="text-slate-500 max-w-md mb-6">{{ error }}</p>
          <button
            @click="fetchAreas"
            class="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:brightness-90 transition-all font-semibold"
          >
            <span class="material-symbols-outlined">refresh</span>
            Tentar novamente
          </button>
        </div>

        <!-- Empty State -->
        <div v-else-if="!loading && areas.length === 0" class="flex flex-col items-center justify-center py-16 text-center">
          <div class="w-20 h-20 bg-sky-100 rounded-full flex items-center justify-center mb-6">
            <span class="material-symbols-outlined text-4xl text-sky-500">maps_home_work</span>
          </div>
          <h2 class="text-xl font-bold text-cyan-900 mb-2">Nenhuma área comum cadastrada</h2>
          <p class="text-slate-500 max-w-md">
            O administrador do condomínio ainda não cadastrou áreas comuns. 
            Quando houver áreas disponíveis, elas aparecerão aqui.
          </p>
        </div>

        <!-- Areas Grid -->
        <div v-else class="space-y-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            <div
              v-for="area in areas"
              :key="area.id"
              @click="goToArea(area.id)"
              class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 transition-all duration-200 cursor-pointer"
              :class="area.isUnderMaintenance ? 'opacity-75 border-amber-200' : 'hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5 group'"
            >
            <!-- Card Header -->
            <div class="flex items-start gap-4 mb-4">
              <div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 transition-colors"
                :class="area.isUnderMaintenance ? '' : 'group-hover:bg-primary/20'">
                <span class="material-symbols-outlined text-primary text-2xl">{{ area.icon || getAreaIcon(area.name) }}</span>
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2 flex-wrap">
                  <h3 class="font-bold text-cyan-900 text-lg truncate">{{ area.name }}</h3>
                  <span
                    v-if="area.isUnderMaintenance"
                    class="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-medium shrink-0"
                  >
                    Em manutenção
                  </span>
                </div>
                <div class="flex items-center gap-2 mt-1">
                  <span
                    v-if="area.capacity"
                    class="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full text-xs font-medium"
                  >
                    <span class="material-symbols-outlined text-[14px]">group</span>
                    {{ area.capacity }} pessoas
                  </span>
                  <span
                    v-if="area.requiresApproval"
                    class="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-700 rounded-full text-xs font-medium"
                  >
                    <span class="material-symbols-outlined text-[14px]">how_to_reg</span>
                    Requer aprovação
                  </span>
                </div>
              </div>
            </div>

            <!-- Description -->
            <p v-if="area.description" class="text-slate-600 text-sm mb-4 line-clamp-2">
              {{ area.description }}
            </p>

            <!-- Operating Info -->
            <div v-if="area.isUnderMaintenance" class="pt-4 border-t border-slate-100">
              <div class="flex items-center gap-2 text-sm text-amber-600 font-medium">
                <span class="material-symbols-outlined text-[18px]">build</span>
                <span>Área temporariamente indisponível para reservas</span>
              </div>
            </div>
            <div v-else class="space-y-2 pt-4 border-t border-slate-100">
              <div class="flex items-center gap-2 text-sm text-slate-600">
                <span class="material-symbols-outlined text-[18px] text-slate-400">schedule</span>
                <span>{{ area.openTime }} - {{ area.closeTime }}</span>
              </div>
              <div class="flex items-center gap-2 text-sm text-slate-600">
                <span class="material-symbols-outlined text-[18px] text-slate-400">calendar_view_week</span>
                <span>{{ formatOperatingDays(area.operatingDays) }}</span>
              </div>
            </div>
            </div>
          </div>

          <!-- Pagination -->
          <Pagination :current="page" :total-pages="totalPages" @page="goToPage" />
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
import { useRouter } from 'vue-router'
import SideNavBar from '@/modules/shared/components/SideNavBar.vue'
import TopAppBar from '@/modules/shared/components/TopAppBar.vue'
import Pagination from '@/modules/shared/components/Pagination.vue'
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

interface ListResponse {
  commonAreas: CommonArea[]
  total: number
  page: number
  limit: number
  totalPages: number
}

const router = useRouter()
const { sidebarOpen, sidebarCollapsed, toggleCollapse } = useSidebar()

const user = authService.getUser()
const userName = ref(user?.name || '')

const areas = ref<CommonArea[]>([])
const total = ref(0)
const loading = ref(false)
const error = ref<string | null>(null)
const page = ref(1)
const totalPages = ref(1)

const DAYS_LABELS: Record<number, string> = {
  1: 'Seg',
  2: 'Ter',
  3: 'Qua',
  4: 'Qui',
  5: 'Sex',
  6: 'Sáb',
  7: 'Dom',
}

function getDaysArray(days: number[] | string | null): number[] {
  if (!days) return []
  if (Array.isArray(days)) {
    const map: Record<number, number> = { 0: 7, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6 }
    return days.map((d) => map[d] ?? d).sort((a, b) => a - b)
  }
  return days.split(',').map(Number).sort((a, b) => a - b)
}

function formatOperatingDays(days: number[] | string | null): string {
  const arr = getDaysArray(days)
  if (arr.length === 0 || arr.length === 7) return 'Todos os dias'
  return arr.map((d) => DAYS_LABELS[d] || '').join(', ')
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

async function fetchAreas() {
  loading.value = true
  error.value = null

  try {
    const response = await http.get('/common-areas', { params: { page: page.value, limit: 6 } })
    const data = response.data.data as ListResponse
    areas.value = data.commonAreas
    total.value = data.total
    totalPages.value = data.totalPages
  } catch (err: any) {
    const message = err?.response?.data?.message || err?.message || 'Não foi possível carregar as áreas comuns.'
    error.value = message
  } finally {
    loading.value = false
  }
}

function goToPage(p: number) {
  page.value = p
  fetchAreas()
}

function goToArea(id: string) {
  router.push(`/resident/common-areas/${id}`)
}

const handleLogout = async () => {
  try {
    await http.post('/auth/logout')
  } catch { /* ignora */ }
  authService.logout()
  router.push('/')
}

onMounted(() => {
  fetchAreas()
})
</script>
