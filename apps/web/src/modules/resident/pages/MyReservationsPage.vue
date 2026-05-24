<template>
  <div class="flex min-h-screen bg-surface text-on-surface">
    <SideNavBar
      role="RESIDENT"
      :userName="userName"
      :collapsed="sidebarCollapsed"
      @toggle-collapse="toggleCollapse"
      @cta-click="handleQuickAction"
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
        <div class="mb-6 md:mb-8">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <span class="material-symbols-outlined text-primary">event_available</span>
            </div>
            <h1 class="text-2xl font-bold text-cyan-900">Minhas Reservas</h1>
            <router-link
              to="/resident/reservations/new"
              class="ml-auto inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl hover:brightness-90 transition-all text-sm font-semibold"
            >
              <span class="material-symbols-outlined text-[16px]">add_circle</span>
              Nova Reserva
            </router-link>
          </div>
          <p class="text-slate-500 ml-[52px]">Gerencie suas reservas nas áreas comuns</p>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="flex items-center justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>

        <template v-else>
          <!-- Filters -->
          <div class="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
            <button
              v-for="f in filterOptions"
              :key="f.value"
              @click="activeFilter = f.value; page = 1; fetchReservations()"
              :class="['px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap', activeFilter === f.value ? 'bg-primary text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50']"
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
            <p class="text-slate-500 max-w-md mb-6">
              {{ activeFilter === 'future' ? 'Você não tem reservas futuras.' : activeFilter === 'past' ? 'Nenhuma reserva anterior.' : 'Nenhuma reserva com este status.' }}
            </p>
            <router-link
              to="/resident/reservations/new"
              class="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:brightness-90 transition-all font-semibold"
            >
              <span class="material-symbols-outlined">add</span>
              Nova Reserva
            </router-link>
          </div>

          <!-- Reservations List -->
          <div v-else class="space-y-3">
            <div
              v-for="res in reservations"
              :key="res.id"
              class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all"
            >
              <!-- Card Header -->
              <div
                @click="toggleExpand(res.id)"
                class="flex items-center gap-4 p-4 md:p-5 cursor-pointer hover:bg-slate-50/50 transition-colors"
              >
                <div class="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <span class="material-symbols-outlined text-primary">{{ res.commonArea?.icon || 'home_work' }}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="font-bold text-cyan-900 truncate">{{ res.commonArea?.name || 'Área' }}</h3>
                  <p class="text-sm text-slate-500">{{ formatResDate(res.startTime) }} &middot; {{ formatTime(res.startTime) }} - {{ formatTime(res.endTime) }}</p>
                </div>
                <div class="flex items-center gap-3 shrink-0">
                  <span :class="['px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider', statusClass(res.status)]">
                    {{ statusLabel(res.status) }}
                  </span>
                  <span class="material-symbols-outlined text-slate-400 transition-transform" :class="expandedId === res.id ? 'rotate-180' : ''">
                    expand_more
                  </span>
                </div>
              </div>

              <!-- Expanded Content -->
              <div v-if="expandedId === res.id" class="border-t border-slate-100 px-4 md:px-5 py-4 bg-slate-50/50">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- Details -->
                  <div class="space-y-2 text-sm">
                    <div class="flex items-center gap-2 text-slate-500">
                      <span class="material-symbols-outlined text-[16px]">calendar_month</span>
                      <span>{{ formatResDate(res.startTime) }}</span>
                    </div>
                    <div class="flex items-center gap-2 text-slate-500">
                      <span class="material-symbols-outlined text-[16px]">schedule</span>
                      <span>{{ formatTime(res.startTime) }} - {{ formatTime(res.endTime) }}</span>
                    </div>
                    <div class="flex items-center gap-2 text-slate-500">
                      <span class="material-symbols-outlined text-[16px]">group</span>
                      <span>{{ res.commonArea?.capacity || 'N/D' }} pessoas</span>
                    </div>
                    <div v-if="res.canceledAt" class="flex items-center gap-2 text-red-500">
                      <span class="material-symbols-outlined text-[16px]">cancel</span>
                      <span>Cancelado em {{ formatResDate(res.canceledAt) }}</span>
                    </div>
                  </div>

                  <!-- Actions -->
                  <div class="flex flex-col gap-2 justify-start items-end">
                    <button
                      v-if="(res.status === 'PENDING' || res.status === 'APPROVED') && !isPastReservation(res)"
                      @click="confirmCancel(res)"
                      class="inline-flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-xl hover:bg-red-100 transition-all text-sm font-medium"
                    >
                      <span class="material-symbols-outlined text-[16px]">cancel</span>
                      Cancelar reserva
                    </button>
                    <router-link
                      :to="`/resident/availability?area=${res.commonAreaId}&date=${res.startTime.split('T')[0]}`"
                      class="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-primary border border-primary/20 rounded-xl hover:bg-primary/5 transition-all text-sm font-medium"
                    >
                      <span class="material-symbols-outlined text-[16px]">calendar_month</span>
                      Ver disponibilidade
                    </router-link>
                  </div>
                </div>

                <!-- Timeline -->
                <div v-if="timelineLoading === res.id" class="flex items-center justify-center py-4">
                  <div class="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
                <div v-else-if="timelines[res.id]" class="mt-4 pt-4 border-t border-slate-100">
                  <p class="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Disponibilidade do dia</p>
                  <div class="space-y-1">
                    <div
                      v-for="(slot, idx) in timelines[res.id]"
                      :key="idx"
                      class="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm"
                      :class="slot.available ? 'bg-emerald-50/50' : 'bg-red-50/50'"
                    >
                      <span class="material-symbols-outlined text-[16px]" :class="slot.available ? 'text-emerald-400' : 'text-red-400'">
                        {{ slot.available ? 'check_circle' : 'block' }}
                      </span>
                      <span class="font-medium" :class="slot.available ? 'text-emerald-700' : 'text-red-700'">
                        {{ slot.start }} - {{ slot.end }}
                      </span>
                      <span v-if="!slot.available" class="text-xs text-red-400 ml-auto">{{ statusLabel(slot.status) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Pagination -->
            <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 pt-4">
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
import { ref, onMounted } from 'vue'
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
const activeFilter = ref('future')
const expandedId = ref<string | null>(null)
const timelines = ref<Record<string, TimeSlot[]>>({})
const timelineLoading = ref<string | null>(null)

const filterOptions = [
  { label: 'Próximas', value: 'future' },
  { label: 'Anteriores', value: 'past' },
  { label: 'Pendentes', value: 'PENDING' },
  { label: 'Confirmadas', value: 'APPROVED' },
  { label: 'Canceladas', value: 'CANCELED' },
]

function getFilterParams(filter: string): Record<string, string> {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`

  switch (filter) {
    case 'future': return { from: new Date().toISOString(), status: 'PENDING,APPROVED' }
    case 'past': return { to: yesterdayStr }
    default: return { status: filter }
  }
}

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

function formatResDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr)
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`
}

function isPastReservation(res: Reservation): boolean {
  return new Date(res.endTime) < new Date()
}

function getDateStr(dateStr: string): string {
  return dateStr.split('T')[0]
}

async function fetchReservations() {
  loading.value = true
  try {
    const params: Record<string, any> = { page: page.value, limit: 10 }
    const filterParams = getFilterParams(activeFilter.value)
    Object.assign(params, filterParams)
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
  const id = reservation.id
  timelineLoading.value = id
  try {
    const dateStr = getDateStr(reservation.startTime)
    const res = await http.get(`/common-areas/${reservation.commonAreaId}/availability`, {
      params: { date: dateStr },
    })
    const availability = (res.data as any).data as any
    const slots: TimeSlot[] = []
    let cursor = availability.openTime
    const sorted = [...(availability.conflicts || [])].sort((a: any, b: any) => a.startTime.localeCompare(b.startTime))
    for (const c of sorted) {
      if (cursor < c.startTime) {
        slots.push({ start: cursor, end: c.startTime, available: true })
      }
      slots.push({ start: c.startTime, end: c.endTime, available: false, status: c.status })
      cursor = c.endTime > cursor ? c.endTime : cursor
    }
    if (cursor < availability.closeTime) {
      slots.push({ start: cursor, end: availability.closeTime, available: true })
    }
    timelines.value[id] = slots
  } catch {
    timelines.value[id] = []
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
  if (res && !timelines.value[id]) {
    fetchTimeline(res)
  }
}

async function confirmCancel(res: Reservation) {
  const msg = `Tem certeza que deseja cancelar a reserva em "${res.commonArea?.name}" no dia ${formatResDate(res.startTime)}?`
  if (!confirm(msg)) return
  try {
    await http.patch(`/reservations/${res.id}/cancel`)
    timelines.value = {}
    await fetchReservations()
  } catch {
    alert('Erro ao cancelar reserva.')
  }
}

function goToPage(p: number) {
  page.value = p
  fetchReservations()
}

const handleQuickAction = (actionId: string) => {
  if (actionId === 'new-reservation') router.push('/resident/reservations/new')
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
