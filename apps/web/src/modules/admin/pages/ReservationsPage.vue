<template>
  <div class="flex min-h-screen bg-surface text-on-surface">
    <SideNavBar
      role="ADMIN"
      :userName="userName"
      :collapsed="sidebarCollapsed"
      @toggle-collapse="toggleCollapse"
      @logout="handleLogout"
      :class="['transition-transform duration-300', sidebarOpen ? 'translate-x-0' : '-translate-x-full', 'fixed z-50', 'md:translate-x-0']"
    />

    <main :class="['flex-1 flex flex-col min-h-screen w-full transition-all duration-300', sidebarCollapsed ? 'md:ml-16' : 'md:ml-72']">
      <TopAppBar
        :userName="userName"
        userRole="ADMIN"
        @toggle-sidebar="sidebarOpen = !sidebarOpen"
      />

      <div class="flex-1 p-4 md:p-6 lg:p-8">
        <div class="mb-6 md:mb-8">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <span class="material-symbols-outlined text-primary">event_available</span>
            </div>
            <h1 class="text-2xl font-bold text-cyan-900">Reservas</h1>
          </div>
          <p class="text-slate-500 ml-[52px]">Todas as reservas do condomínio</p>
        </div>

        <div v-if="loading" class="flex items-center justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>

        <template v-else>
          <!-- Filters -->
          <div class="flex flex-wrap items-center gap-3 mb-6">
            <button
              v-for="f in filterOptions"
              :key="f.value"
              @click="statusFilter = f.value; fetchReservations()"
              :class="['px-4 py-2 rounded-xl text-sm font-medium transition-all', statusFilter === f.value ? 'bg-primary text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50']"
            >
              {{ f.label }}
            </button>
          </div>

          <!-- Empty -->
          <div v-if="reservations.length === 0" class="flex flex-col items-center justify-center py-16 text-center">
            <div class="w-20 h-20 bg-sky-100 rounded-full flex items-center justify-center mb-6">
              <span class="material-symbols-outlined text-4xl text-sky-500">event_busy</span>
            </div>
            <h2 class="text-xl font-bold text-cyan-900 mb-2">Nenhuma reserva encontrada</h2>
            <p class="text-slate-500 max-w-md">{{ statusFilter ? 'Nenhuma reserva com este status.' : 'Nenhuma reserva cadastrada no condomínio.' }}</p>
          </div>

          <!-- Table -->
          <div v-else class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b border-slate-100 bg-slate-50/50">
                    <th class="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 md:px-5 py-3">Área</th>
                    <th class="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Morador</th>
                    <th class="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Data</th>
                    <th class="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Horário</th>
                    <th class="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Status</th>
                    <th class="text-right text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 md:px-5 py-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="res in reservations"
                    :key="res.id"
                    @click="toggleExpand(res.id)"
                    class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer"
                  >
                    <td class="px-4 md:px-5 py-4">
                      <div class="flex items-center gap-3">
                        <div class="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                          <span class="material-symbols-outlined text-primary text-[18px]">{{ res.commonArea?.icon || 'home_work' }}</span>
                        </div>
                        <span class="font-medium text-cyan-900 text-sm">{{ res.commonArea?.name }}</span>
                      </div>
                    </td>
                    <td class="px-4 py-4 text-sm text-slate-600">{{ res.resident?.user?.name || 'N/D' }}</td>
                    <td class="px-4 py-4 text-sm text-slate-600 whitespace-nowrap">{{ formatResDate(res.startTime) }}</td>
                    <td class="px-4 py-4 text-sm text-slate-600 whitespace-nowrap">{{ formatTime(res.startTime) }} - {{ formatTime(res.endTime) }}</td>
                    <td class="px-4 py-4">
                      <span :class="['px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider', statusClass(res.status)]">{{ statusLabel(res.status) }}</span>
                    </td>
                    <td class="px-4 md:px-5 py-4 text-right">
                      <span class="material-symbols-outlined text-slate-400 transition-transform" :class="expandedId === res.id ? 'rotate-180' : ''">expand_more</span>
                    </td>
                  </tr>

                  <!-- Expanded Row -->
                  <tr v-for="res in expandedReservations" :key="'exp-' + res.id">
                    <td colspan="6" class="px-4 md:px-5 pb-4">
                      <div class="bg-slate-50 rounded-xl p-4">
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div class="space-y-1.5 text-sm">
                            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Detalhes</p>
                            <p class="text-slate-600"><strong>Área:</strong> {{ res.commonArea?.name }}</p>
                            <p class="text-slate-600"><strong>Morador:</strong> {{ res.resident?.user?.name || 'N/D' }}</p>
                            <p v-if="res.resident?.user?.email" class="text-slate-600"><strong>Email:</strong> {{ res.resident.user.email }}</p>
                            <p v-if="res.notes" class="text-slate-600"><strong>Obs:</strong> {{ res.notes }}</p>
                            <p v-if="res.canceledAt" class="text-red-500"><strong>Cancelado em:</strong> {{ formatResDate(res.canceledAt) }}</p>
                          </div>
                          <div class="space-y-1.5 text-sm">
                            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Disponibilidade do dia</p>
                            <div v-if="timelineLoading === res.id" class="flex items-center py-2">
                              <div class="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                            </div>
                            <div v-else-if="timelines[res.id]" class="space-y-1">
                              <div v-for="(slot, idx) in timelines[res.id]" :key="idx" class="flex items-center gap-2 text-sm" :class="slot.available ? 'text-emerald-700' : 'text-red-700'">
                                <span class="material-symbols-outlined text-[14px]">{{ slot.available ? 'check_circle' : 'block' }}</span>
                                <span>{{ slot.start }} - {{ slot.end }}</span>
                                <span v-if="!slot.available" class="text-xs text-red-400">({{ statusLabel(slot.status) }})</span>
                              </div>
                            </div>
                          </div>
                          <div class="flex flex-col gap-2 justify-start items-end">
                            <template v-if="res.status === 'PENDING'">
                              <button
                                @click.stop="confirmApprove(res)"
                                class="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-all text-sm font-medium"
                              >
                                <span class="material-symbols-outlined text-[16px]">check_circle</span>
                                Aprovar
                              </button>
                              <button
                                @click.stop="confirmReject(res)"
                                class="inline-flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-xl hover:bg-red-100 transition-all text-sm font-medium"
                              >
                                <span class="material-symbols-outlined text-[16px]">cancel</span>
                                Rejeitar
                              </button>
                            </template>
                            <button
                              v-if="(res.status === 'PENDING' || res.status === 'APPROVED') && !isPastReservation(res)"
                              @click.stop="confirmCancel(res)"
                              class="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-200 transition-all text-sm font-medium"
                            >
                              <span class="material-symbols-outlined text-[16px]">block</span>
                              Cancelar
                            </button>
                            <router-link
                              :to="`/condominium/availability?area=${res.commonAreaId}&date=${res.startTime.split('T')[0]}`"
                              class="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-primary border border-primary/20 rounded-xl hover:bg-primary/5 transition-all text-sm font-medium"
                            >
                              <span class="material-symbols-outlined text-[16px]">calendar_month</span>
                              Ver disponibilidade
                            </router-link>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 py-4 border-t border-slate-100">
              <button
                v-for="p in totalPages"
                :key="p"
                @click="goToPage(p)"
                :class="['min-w-[36px] h-9 rounded-lg text-sm font-medium transition-all', p === page ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100']"
              >
                {{ p }}
              </button>
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

interface CommonAreaInfo {
  id: string
  name: string
  icon: string | null
  capacity: number | null
}

interface ResidentInfo {
  id: string
  user: { name: string; email: string }
}

interface Reservation {
  id: string
  residentId: string
  commonAreaId: string
  startTime: string
  endTime: string
  status: string
  notes: string | null
  canceledById: string | null
  canceledAt: string | null
  createdAt: string
  updatedAt: string
  commonArea: CommonAreaInfo | null
  resident: ResidentInfo | null
}

interface ListResponse {
  reservations: Reservation[]
  total: number
  page: number
  limit: number
  totalPages: number
}

interface TimeSlot {
  start: string
  end: string
  available: boolean
  status?: string
}

const router = useRouter()
const { sidebarOpen, sidebarCollapsed, toggleCollapse } = useSidebar()

const user = authService.getUser()
const userName = ref(user?.name || '')

const reservations = ref<Reservation[]>([])
const loading = ref(true)
const page = ref(1)
const totalPages = ref(1)
const statusFilter = ref('')
const expandedId = ref<string | null>(null)
const timelines = ref<Record<string, TimeSlot[]>>({})
const timelineLoading = ref<string | null>(null)

const filterOptions = [
  { label: 'Todas', value: '' },
  { label: 'Pendentes', value: 'PENDING' },
  { label: 'Confirmadas', value: 'APPROVED' },
  { label: 'Canceladas', value: 'CANCELED' },
]

const expandedReservations = computed(() => {
  return reservations.value.filter((r) => expandedId.value === r.id)
})

function statusClass(status: string): string {
  const map: Record<string, string> = {
    PENDING: 'bg-amber-50 text-amber-700',
    APPROVED: 'bg-emerald-50 text-emerald-700',
    REJECTED: 'bg-red-50 text-red-700',
    CANCELED: 'bg-slate-100 text-slate-500',
  }
  return map[status] || 'bg-slate-100 text-slate-500'
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    PENDING: 'Pendente',
    APPROVED: 'Confirmada',
    REJECTED: 'Rejeitada',
    CANCELED: 'Cancelada',
  }
  return map[status] || status
}

function isPastReservation(res: Reservation): boolean {
  return new Date(res.endTime) < new Date()
}

function formatResDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr)
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`
}

async function fetchReservations() {
  loading.value = true
  try {
    const params: Record<string, any> = { page: page.value, limit: 10 }
    if (statusFilter.value) params.status = statusFilter.value
    const res = await http.get('/reservations', { params })
    const data = (res.data as any).data as ListResponse
    reservations.value = data.reservations
    totalPages.value = data.totalPages
  } catch {
    reservations.value = []
  } finally {
    loading.value = false
  }
}

async function fetchTimeline(reservation: Reservation) {
  timelineLoading.value = reservation.id
  try {
    const dateStr = reservation.startTime.split('T')[0]
    const res = await http.get(`/common-areas/${reservation.commonAreaId}/availability`, {
      params: { date: dateStr },
    })
    const availability = (res.data as any).data as any
    const slots: TimeSlot[] = []
    let cursor = availability.openTime
    const sorted = [...(availability.conflicts || [])].sort((a: any, b: any) => a.startTime.localeCompare(b.startTime))
    for (const c of sorted) {
      if (cursor < c.startTime) slots.push({ start: cursor, end: c.startTime, available: true })
      slots.push({ start: c.startTime, end: c.endTime, available: false, status: c.status })
      cursor = c.endTime > cursor ? c.endTime : cursor
    }
    if (cursor < availability.closeTime) slots.push({ start: cursor, end: availability.closeTime, available: true })
    timelines.value[reservation.id] = slots
  } catch {
    timelines.value[reservation.id] = []
  } finally {
    timelineLoading.value = null
  }
}

function toggleExpand(id: string) {
  if (expandedId.value === id) {
    expandedId.value = null
    return
  }
  expandedId.value = id
  const res = reservations.value.find((r) => r.id === id)
  if (res && !timelines.value[id]) fetchTimeline(res)
}

async function confirmCancel(res: Reservation) {
  if (!confirm(`Cancelar reserva de ${res.resident?.user?.name || 'N/D'} em "${res.commonArea?.name}"?`)) return
  try {
    await http.patch(`/reservations/${res.id}/cancel`)
    timelines.value = {}
    await fetchReservations()
    expandedId.value = null
  } catch {
    alert('Erro ao cancelar reserva.')
  }
}

async function confirmApprove(res: Reservation) {
  if (!confirm(`Aprovar reserva de ${res.resident?.user?.name || 'N/D'} para "${res.commonArea?.name}"?`)) return
  try {
    await http.patch(`/reservations/${res.id}/approve`)
    timelines.value = {}
    await fetchReservations()
    expandedId.value = null
  } catch {
    alert('Erro ao aprovar reserva.')
  }
}

async function confirmReject(res: Reservation) {
  if (!confirm(`Rejeitar reserva de ${res.resident?.user?.name || 'N/D'} para "${res.commonArea?.name}"?`)) return
  try {
    await http.patch(`/reservations/${res.id}/reject`)
    timelines.value = {}
    await fetchReservations()
    expandedId.value = null
  } catch {
    alert('Erro ao rejeitar reserva.')
  }
}

function goToPage(p: number) {
  page.value = p
  fetchReservations()
}

const handleLogout = async () => {
  try { await http.post('/auth/logout') } catch {}
  authService.logout()
  router.push('/')
}

onMounted(() => {
  fetchReservations()
})
</script>

<style scoped>
.material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>
