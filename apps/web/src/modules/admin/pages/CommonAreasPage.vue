<template>
  <div class="flex min-h-screen bg-surface text-on-surface">
    <SideNavBar
      role="ADMIN"
      :userName="userName"
      :collapsed="sidebarCollapsed"
      @toggle-collapse="toggleCollapse"
      @logout="handleLogout"
      @cta-click="handleQuickAction"
      :class="['transition-transform duration-300', sidebarOpen ? 'translate-x-0' : '-translate-x-full', 'fixed z-50', 'md:translate-x-0']" />

    <main :class="['flex-1 flex flex-col min-h-screen w-full transition-all duration-300', sidebarCollapsed ? 'md:ml-16' : 'md:ml-72']">
      <TopAppBar
        :userName="userName"
        userRole="ADMIN"
        @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <div class="flex-1 p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 lg:space-y-8 w-full max-w-full">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-2xl md:text-3xl font-extrabold text-primary tracking-tight font-headline">Áreas Comuns</h2>
            <p class="text-on-surface-variant mt-1 md:mt-2 text-sm md:text-base">Gerencie as áreas comuns do condomínio</p>
          </div>
          <router-link
            to="/condominium/common-areas/new"
            class="w-full sm:w-auto px-4 md:px-6 py-2.5 md:py-3 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-sm md:text-base"
          >
            <span class="material-symbols-outlined text-lg">add</span>
            <span>Nova Área</span>
          </router-link>
        </div>

        <!-- Filters -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4">
          <div class="relative w-full sm:max-w-xs">
            <span class="material-symbols-outlined absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              v-model="searchQuery"
              class="w-full pl-10 md:pl-12 pr-4 py-2.5 md:py-3 bg-surface-container-low border-none rounded-xl text-sm md:text-base"
              placeholder="Buscar áreas..."
              type="text"
            />
          </div>
          <select v-model="filterApproval" class="w-full sm:w-auto px-3 md:px-4 py-2.5 md:py-3 bg-surface-container-low border-none rounded-xl text-sm md:text-base">
            <option value="all">Todas</option>
            <option value="required">Requer aprovação</option>
            <option value="free">Livre</option>
          </select>
          <select v-model="filterMaintenance" class="w-full sm:w-auto px-3 md:px-4 py-2.5 md:py-3 bg-surface-container-low border-none rounded-xl text-sm md:text-base">
            <option value="all">Qualquer status</option>
            <option value="maintenance">Em manutenção</option>
            <option value="available">Disponível</option>
          </select>
        </div>

        <!-- Table -->
        <div class="bg-surface-container-lowest rounded-2xl md:rounded-3xl overflow-hidden shadow-sm">
          <!-- Desktop Table -->
          <div v-if="!loading" class="hidden md:block overflow-x-auto">
            <table class="w-full">
              <thead class="bg-surface-container-low">
                <tr>
                  <th class="text-left px-4 md:px-6 py-4 text-sm font-semibold text-slate-600">Área</th>
                  <th class="text-left px-4 md:px-6 py-4 text-sm font-semibold text-slate-600">Capacidade</th>
                  <th class="text-left px-4 md:px-6 py-4 text-sm font-semibold text-slate-600">Horário</th>
                  <th class="text-left px-4 md:px-6 py-4 text-sm font-semibold text-slate-600">Dias</th>
                  <th class="text-left px-4 md:px-6 py-4 text-sm font-semibold text-slate-600">Aprovação</th>
                  <th class="text-left px-4 md:px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
                  <th class="text-left px-4 md:px-6 py-4 text-sm font-semibold text-slate-600">Ações</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="area in filteredAreas" :key="area.id" class="hover:bg-white transition-colors">
                  <td class="px-4 md:px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <span class="material-symbols-outlined">{{ area.icon || getAreaIcon(area.name) }}</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <p class="font-semibold text-cyan-900 text-sm md:text-base">{{ area.name }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-4 md:px-6 py-4 text-slate-600 text-sm md:text-base">
                    {{ area.capacity ? `${area.capacity} pessoas` : '—' }}
                  </td>
                  <td class="px-4 md:px-6 py-4 text-slate-600 text-sm md:text-base whitespace-nowrap">
                    {{ area.openTime }} - {{ area.closeTime }}
                  </td>
                  <td class="px-4 md:px-6 py-4">
                    <div class="flex gap-1 flex-wrap">
                      <span
                        v-for="day in getOperatingDaysList(area.operatingDays)"
                        :key="day.value"
                        :class="['w-7 h-7 rounded-full text-xs font-medium flex items-center justify-center', day.active ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-300']"
                        :title="day.label"
                      >
                        {{ day.label[0] }}
                      </span>
                    </div>
                  </td>
                  <td class="px-4 md:px-6 py-4">
                    <span :class="['px-3 py-1.5 rounded-full text-xs md:text-sm font-semibold', area.requiresApproval ? 'bg-orange-50 text-orange-700' : 'bg-tertiary-container text-on-tertiary-fixed']">
                      {{ area.requiresApproval ? 'Requer' : 'Livre' }}
                    </span>
                  </td>
                  <td class="px-4 md:px-6 py-4">
                    <span v-if="area.isUnderMaintenance" class="px-3 py-1.5 rounded-full text-xs md:text-sm font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      Em manutenção
                    </span>
                    <span v-else class="text-sm text-slate-400">—</span>
                  </td>
                  <td class="px-4 md:px-6 py-4">
                    <div class="flex items-center gap-1 md:gap-2">
                      <router-link
                        :to="`/condominium/common-areas/${area.id}/edit`"
                        class="p-2 text-slate-400 hover:text-primary transition-colors"
                        title="Editar"
                      >
                        <span class="material-symbols-outlined">edit</span>
                      </router-link>
                      <button
                        @click="confirmDelete(area)"
                        class="p-2 text-slate-400 hover:text-error transition-colors"
                        title="Excluir"
                      >
                        <span class="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Loading skeleton -->
          <div v-if="loading" class="hidden md:block p-8">
            <div class="space-y-4">
              <div v-for="n in 4" :key="n" class="flex items-center gap-4 animate-pulse">
                <div class="w-10 h-10 bg-slate-200 rounded-full" />
                <div class="flex-1 space-y-2">
                  <div class="h-4 bg-slate-200 rounded w-1/4" />
                  <div class="h-3 bg-slate-200 rounded w-1/3" />
                </div>
                <div class="h-4 bg-slate-200 rounded w-20" />
                <div class="h-4 bg-slate-200 rounded w-24" />
                <div class="h-6 bg-slate-200 rounded w-16" />
                <div class="flex gap-2">
                  <div class="w-8 h-8 bg-slate-200 rounded-lg" />
                  <div class="w-8 h-8 bg-slate-200 rounded-lg" />
                </div>
              </div>
            </div>
          </div>

          <!-- Mobile Cards -->
          <div class="md:hidden divide-y divide-slate-100">
            <div v-if="loading" class="p-8 text-center text-slate-400">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
              <p class="mt-2">Carregando...</p>
            </div>
            <div v-else-if="filteredAreas.length === 0" class="p-8 text-center text-slate-400">
              <span class="material-symbols-outlined text-5xl">maps_home_work</span>
              <p class="mt-2">Nenhuma área encontrada</p>
            </div>
            <div v-else v-for="area in filteredAreas" :key="area.id" class="p-4 hover:bg-white transition-colors">
              <div class="flex items-start gap-3">
                <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  <span class="material-symbols-outlined">{{ area.icon || getAreaIcon(area.name) }}</span>
                </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <p class="font-semibold text-cyan-900">{{ area.name }}</p>
                    </div>
                  <p class="text-sm text-slate-500">{{ area.capacity ? `${area.capacity} pessoas` : 'Capacidade não definida' }} • {{ area.openTime }} - {{ area.closeTime }}</p>
                  <div class="flex gap-1 mt-1.5">
                    <span
                      v-for="day in getOperatingDaysList(area.operatingDays)"
                      :key="day.value"
                      :class="['w-6 h-6 rounded-full text-[10px] font-medium flex items-center justify-center', day.active ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-300']"
                    >
                      {{ day.label[0] }}
                    </span>
                  </div>
                </div>
                <span :class="['px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0', area.requiresApproval ? 'bg-orange-50 text-orange-700' : 'bg-tertiary-container text-on-tertiary-fixed']">
                  {{ area.requiresApproval ? 'Requer' : 'Livre' }}
                </span>
                <span v-if="area.isUnderMaintenance" class="px-2 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex-shrink-0">
                  Manutenção
                </span>
              </div>
              <div class="flex items-center gap-2 mt-3 ml-15">
                <router-link
                  :to="`/condominium/common-areas/${area.id}/edit`"
                  class="flex-1 py-2 text-center text-sm text-slate-600 hover:text-primary border border-slate-200 rounded-lg"
                >
                  Editar
                </router-link>
                <button
                  @click.prevent="confirmDelete(area)"
                  class="flex-1 py-2 text-center text-sm text-error hover:bg-error/5 border border-error/20 rounded-lg"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>

        <Pagination :current="page" :total-pages="totalPages" @page="goToPage" />
      </div>
    </main>

    <!-- Mobile Overlay -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 bg-black/50 z-40 md:hidden"
      @click="sidebarOpen = false"
    ></div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <h3 class="text-xl font-bold text-cyan-900 mb-2">Confirmar Exclusão</h3>
        <p class="text-slate-600 mb-6">
          Tem certeza que deseja excluir a área <strong>{{ deletingArea?.name }}</strong>?
        </p>
        <p v-if="deleteError" class="text-sm text-red-600 mb-4 p-2 bg-red-50 rounded-lg">{{ deleteError }}</p>
        <div class="flex gap-3">
          <button
            @click="showDeleteModal = false"
            class="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="handleDelete"
            :disabled="deleting"
            class="flex-1 px-4 py-3 bg-error text-white rounded-xl hover:bg-error/90 transition-colors disabled:opacity-50"
          >
            {{ deleting ? 'Excluindo...' : 'Excluir' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import SideNavBar from '@/modules/shared/components/SideNavBar.vue'
import TopAppBar from '@/modules/shared/components/TopAppBar.vue'
import Pagination from '@/modules/shared/components/Pagination.vue'
import { authService } from '@/modules/auth/services/auth.service'
import { http } from '@/api/http'
import { useToast } from '@/modules/shared/composables/useToast'
import { useApiError } from '@/modules/shared/composables/useApiError'
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
}

interface ListResponse {
  commonAreas: CommonArea[]
  total: number
  page: number
  limit: number
  totalPages: number
}

const router = useRouter()
const { error: showError, success: showSuccess } = useToast()
const { handleError } = useApiError()

const user = authService.getUser()
const userName = ref(user?.name || '')

const { sidebarOpen, sidebarCollapsed, toggleCollapse } = useSidebar()
const areas = ref<CommonArea[]>([])
const loading = ref(false)
const searchQuery = ref('')
const filterApproval = ref('all')
const filterMaintenance = ref('all')
const page = ref(1)
const totalPages = ref(1)
const showDeleteModal = ref(false)
const deletingArea = ref<CommonArea | null>(null)
const deleting = ref(false)
const deleteError = ref<string | null>(null)

const filteredAreas = computed(() => {
  let result = areas.value

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(a =>
      a.name.toLowerCase().includes(q) ||
      (a.description && a.description.toLowerCase().includes(q))
    )
  }

  if (filterApproval.value === 'required') {
    result = result.filter(a => a.requiresApproval)
  } else if (filterApproval.value === 'free') {
    result = result.filter(a => !a.requiresApproval)
  }

  if (filterMaintenance.value === 'maintenance') {
    result = result.filter(a => a.isUnderMaintenance)
  } else if (filterMaintenance.value === 'available') {
    result = result.filter(a => !a.isUnderMaintenance)
  }

  return result
})

function getAreaIcon(name: string): string {
  const lower = name.toLowerCase()
  if (lower.includes('piscina')) return 'pool'
  if (lower.includes('churrasqueira') || lower.includes('churrasco')) return 'outdoor_grill'
  if (lower.includes('salão') || lower.includes('festa')) return 'celebration'
  if (lower.includes('quadra') || lower.includes('esporte')) return 'sports_tennis'
  if (lower.includes('academia') || lower.includes('ginástica')) return 'fitness_center'
  if (lower.includes('jogos') || lower.includes('game')) return 'sports_esports'
  if (lower.includes('cozinha') || lower.includes('gourmet')) return 'kitchen'
  if (lower.includes('brinquedoteca') || lower.includes('play')) return 'toys'
  return 'home_work'
}

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
    ...DAYS_MAP[v]!,
    active: activeDays.has(v),
  }))
}

async function goToPage(p: number) {
  page.value = p
  await fetchAreas()
}

async function fetchAreas() {
  loading.value = true
  try {
    const response = await http.get('/common-areas', { params: { page: page.value, limit: 5 } })
    const data = response.data.data as ListResponse
    areas.value = data.commonAreas
    totalPages.value = data.totalPages
  } catch (err) {
    handleError(err, 'Erro ao carregar áreas')
  } finally {
    loading.value = false
  }
}

function confirmDelete(area: CommonArea) {
  deletingArea.value = area
  deleteError.value = null
  showDeleteModal.value = true
}

async function handleDelete() {
  if (!deletingArea.value) return
  deleting.value = true
  deleteError.value = null
  try {
    await http.delete(`/common-areas/${deletingArea.value.id}`)
    showSuccess('Área excluída com sucesso')
    showDeleteModal.value = false
    deletingArea.value = null
    await fetchAreas()
  } catch (err: any) {
    deleteError.value = err?.response?.data?.message || err?.message || 'Erro ao excluir.'
  } finally {
    deleting.value = false
  }
}

const handleQuickAction = () => {
  router.push('/condominium/common-areas/new')
}

const handleLogout = async () => {
  try { await http.post('/auth/logout') } catch { /* ok */ }
  authService.logout()
  router.push('/')
}

onMounted(() => {
  fetchAreas()
})
</script>

<style scoped>
.font-headline { font-family: 'Manrope', sans-serif; }
.material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>
