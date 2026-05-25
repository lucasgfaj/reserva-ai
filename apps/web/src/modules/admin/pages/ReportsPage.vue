<template>
  <div class="flex min-h-screen bg-surface text-on-surface">
    <SideNavBar
      role="ADMIN"
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
        userRole="ADMIN"
        @toggle-sidebar="sidebarOpen = !sidebarOpen"
      />

      <div class="flex-1 p-4 md:p-6 lg:p-8 w-full max-w-full">
        <div class="mb-6 md:mb-8">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <span class="material-symbols-outlined text-primary">assessment</span>
            </div>
            <h1 class="text-2xl font-bold text-cyan-900">Relatórios</h1>
          </div>
          <p class="text-slate-500 ml-[52px]">Visão geral de reservas e ocupação do condomínio</p>
        </div>

        <div v-if="loading" class="flex items-center justify-center py-16">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>

        <template v-else>
          <!-- Summary cards -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <div class="bg-white rounded-2xl p-5 md:p-6 border border-slate-100 shadow-sm">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <span class="material-symbols-outlined text-primary">event_busy</span>
                </div>
                <div>
                  <p class="text-xs text-slate-500 font-medium">Canceladas</p>
                  <p class="text-2xl font-bold text-cyan-900">{{ canceledCount }}</p>
                </div>
              </div>
              <div class="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div class="h-full bg-red-400 rounded-full" :style="{ width: canceledPercent + '%' }"></div>
              </div>
            </div>

            <div class="bg-white rounded-2xl p-5 md:p-6 border border-slate-100 shadow-sm">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 bg-secondary-container/30 rounded-xl flex items-center justify-center">
                  <span class="material-symbols-outlined text-secondary">pending</span>
                </div>
                <div>
                  <p class="text-xs text-slate-500 font-medium">Pendentes</p>
                  <p class="text-2xl font-bold text-cyan-900">{{ pendingCount }}</p>
                </div>
              </div>
              <div class="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div class="h-full bg-amber-400 rounded-full" :style="{ width: pendingPercent + '%' }"></div>
              </div>
            </div>

            <div class="bg-white rounded-2xl p-5 md:p-6 border border-slate-100 shadow-sm">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 bg-tertiary-container/30 rounded-xl flex items-center justify-center">
                  <span class="material-symbols-outlined text-tertiary">check_circle</span>
                </div>
                <div>
                  <p class="text-xs text-slate-500 font-medium">Confirmadas</p>
                  <p class="text-2xl font-bold text-cyan-900">{{ approvedCount }}</p>
                </div>
              </div>
              <div class="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div class="h-full bg-emerald-400 rounded-full" :style="{ width: approvedPercent + '%' }"></div>
              </div>
            </div>

            <div class="bg-white rounded-2xl p-5 md:p-6 border border-slate-100 shadow-sm">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <span class="material-symbols-outlined text-primary">database</span>
                </div>
                <div>
                  <p class="text-xs text-slate-500 font-medium">Total</p>
                  <p class="text-2xl font-bold text-cyan-900">{{ totalCount }}</p>
                </div>
              </div>
              <div class="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div class="h-full bg-primary rounded-full" :style="{ width: '100%' }"></div>
              </div>
            </div>
          </div>

          <!-- Common areas usage -->
          <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div class="px-6 md:px-8 pt-6 pb-4 border-b border-slate-100">
              <h2 class="text-lg font-bold text-cyan-900">Uso por Área Comum</h2>
              <p class="text-sm text-slate-500">Quantidade de reservas por área</p>
            </div>

            <!-- Desktop table -->
            <div class="hidden md:block overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-slate-100">
                    <th class="text-left px-6 py-4 font-semibold text-slate-500">Área</th>
                    <th class="text-center px-4 py-4 font-semibold text-slate-500">Confirmadas</th>
                    <th class="text-center px-4 py-4 font-semibold text-slate-500">Pendentes</th>
                    <th class="text-center px-4 py-4 font-semibold text-slate-500">Canceladas</th>
                    <th class="text-center px-4 py-4 font-semibold text-slate-500">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="area in paginatedAreas"
                    :key="area.id"
                    class="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors"
                  >
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-3">
                        <span class="material-symbols-outlined text-slate-400">{{ area.icon || 'place' }}</span>
                        <span class="font-medium text-cyan-900">{{ area.name }}</span>
                      </div>
                    </td>
                    <td class="text-center px-4 py-4 text-emerald-600 font-medium">{{ area.approved }}</td>
                    <td class="text-center px-4 py-4 text-amber-600 font-medium">{{ area.pending }}</td>
                    <td class="text-center px-4 py-4 text-red-500 font-medium">{{ area.canceled }}</td>
                    <td class="text-center px-4 py-4 font-bold text-cyan-900">{{ area.total }}</td>
                  </tr>
                  <tr v-if="paginatedAreas.length === 0">
                    <td colspan="5" class="text-center py-8 text-slate-400">Nenhuma área comum cadastrada.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Mobile cards -->
            <div class="md:hidden divide-y divide-slate-100">
              <div
                v-for="area in paginatedAreas"
                :key="area.id"
                class="px-4 py-4"
              >
                <div class="flex items-center gap-3 mb-3">
                  <span class="material-symbols-outlined text-slate-400">{{ area.icon || 'place' }}</span>
                  <span class="font-medium text-cyan-900 text-sm">{{ area.name }}</span>
                </div>
                <div class="grid grid-cols-4 gap-2 text-center text-xs">
                  <div class="bg-emerald-50 rounded-xl p-2">
                    <p class="text-emerald-600 font-bold text-sm">{{ area.approved }}</p>
                    <p class="text-emerald-500">Confirmadas</p>
                  </div>
                  <div class="bg-amber-50 rounded-xl p-2">
                    <p class="text-amber-600 font-bold text-sm">{{ area.pending }}</p>
                    <p class="text-amber-500">Pendentes</p>
                  </div>
                  <div class="bg-red-50 rounded-xl p-2">
                    <p class="text-red-500 font-bold text-sm">{{ area.canceled }}</p>
                    <p class="text-red-400">Canceladas</p>
                  </div>
                  <div class="bg-primary/5 rounded-xl p-2">
                    <p class="text-primary font-bold text-sm">{{ area.total }}</p>
                    <p class="text-primary/60">Total</p>
                  </div>
                </div>
              </div>
              <div v-if="paginatedAreas.length === 0" class="text-center py-8 text-slate-400 text-sm px-4">
                Nenhuma área comum cadastrada.
              </div>
            </div>

            <!-- Pagination -->
            <div v-if="totalPages > 1" class="flex items-center justify-between px-4 md:px-6 py-4 border-t border-slate-100">
              <p class="text-xs text-slate-500">
                {{ (currentPage - 1) * perPage + 1 }}-{{ Math.min(currentPage * perPage, areaStats.length) }} de {{ areaStats.length }}
              </p>
              <div class="flex items-center gap-2">
                <button
                  @click="changePage(currentPage - 1)"
                  :disabled="currentPage <= 1"
                  class="px-3 py-1.5 border border-slate-200 rounded-lg text-xs disabled:opacity-50 hover:bg-slate-50 transition-all"
                >
                  Anterior
                </button>
                <button
                  v-for="p in visiblePages"
                  :key="p"
                  @click="changePage(p)"
                  :class="[
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                    p === currentPage ? 'bg-primary text-white' : 'border border-slate-200 hover:bg-slate-50'
                  ]"
                >
                  {{ p }}
                </button>
                <button
                  @click="changePage(currentPage + 1)"
                  :disabled="currentPage >= totalPages"
                  class="px-3 py-1.5 border border-slate-200 rounded-lg text-xs disabled:opacity-50 hover:bg-slate-50 transition-all"
                >
                  Próxima
                </button>
              </div>
            </div>
          </div>
        </template>
      </div>
    </main>

    <div v-if="sidebarOpen" class="fixed inset-0 bg-black/50 z-40 md:hidden" @click="sidebarOpen = false"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import SideNavBar from '@/modules/shared/components/SideNavBar.vue'
import TopAppBar from '@/modules/shared/components/TopAppBar.vue'
import { authService } from '@/modules/auth/services/auth.service'
import { http } from '@/api/http'
import { useSidebar } from '@/modules/shared/composables/useSidebar'

interface CommonArea {
  id: string
  name: string
  icon: string | null
}

interface Reservation {
  id: string
  commonAreaId: string
  status: string
  commonArea?: CommonArea
}

interface AreaStat {
  id: string
  name: string
  icon: string | null
  approved: number
  pending: number
  canceled: number
  total: number
}

const router = useRouter()
const { sidebarOpen, sidebarCollapsed, toggleCollapse } = useSidebar()

const user = authService.getUser()
const userName = ref(user?.name || '')

const loading = ref(true)
const totalCount = ref(0)
const approvedCount = ref(0)
const pendingCount = ref(0)
const canceledCount = ref(0)
const areaStats = ref<AreaStat[]>([])

const currentPage = ref(1)
const perPage = 5
const visiblePages = computed(() => {
  const total = totalPages.value
  const curr = currentPage.value
  const pages: number[] = []
  const start = Math.max(1, curr - 1)
  const end = Math.min(total, curr + 1)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})
const totalPages = computed(() => Math.ceil(areaStats.value.length / perPage))
const paginatedAreas = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return areaStats.value.slice(start, start + perPage)
})

const approvedPercent = computed(() => totalCount.value ? Math.round(approvedCount.value / totalCount.value * 100) : 0)
const pendingPercent = computed(() => totalCount.value ? Math.round(pendingCount.value / totalCount.value * 100) : 0)
const canceledPercent = computed(() => totalCount.value ? Math.round(canceledCount.value / totalCount.value * 100) : 0)

async function loadReports() {
  loading.value = true
  try {
    const [areasRes, allRes] = await Promise.all([
      http.get('/common-areas'),
      http.get('/reservations', { params: { limit: 1000 } }),
    ])

    const areas: CommonArea[] = (areasRes.data as any).data?.commonAreas || []
    const reservations: Reservation[] = (allRes.data as any).data?.reservations || []

    totalCount.value = reservations.length
    approvedCount.value = reservations.filter(r => r.status === 'APPROVED').length
    pendingCount.value = reservations.filter(r => r.status === 'PENDING').length
    canceledCount.value = reservations.filter(r => r.status === 'CANCELED' || r.status === 'REJECTED').length

    areaStats.value = areas.map(area => {
      const areaReservations = reservations.filter(r => r.commonAreaId === area.id)
      return {
        id: area.id,
        name: area.name,
        icon: area.icon,
        approved: areaReservations.filter(r => r.status === 'APPROVED').length,
        pending: areaReservations.filter(r => r.status === 'PENDING').length,
        canceled: areaReservations.filter(r => r.status === 'CANCELED' || r.status === 'REJECTED').length,
        total: areaReservations.length,
      }
    }).sort((a, b) => b.total - a.total)
    currentPage.value = 1
  } catch {
    // fallback
  } finally {
    loading.value = false
  }
}

function changePage(page: number) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
}

const handleQuickAction = () => {}

const handleLogout = async () => {
  try { await http.post('/auth/logout') } catch {}
  authService.logout()
  router.push('/')
}

onMounted(() => {
  loadReports()
})
</script>

<style scoped>
.material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>
