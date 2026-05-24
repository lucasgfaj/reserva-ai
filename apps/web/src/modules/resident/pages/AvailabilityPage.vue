<template>
  <div class="flex min-h-screen bg-surface text-on-surface">
    <SideNavBar
      :role="userRole"
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
        :userRole="userRole"
        @toggle-sidebar="sidebarOpen = !sidebarOpen"
      />

      <div class="flex-1 p-4 md:p-6 lg:p-8">
        <div class="mb-6 md:mb-8">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <span class="material-symbols-outlined text-primary">calendar_month</span>
            </div>
            <h1 class="text-2xl font-bold text-cyan-900">Consultar Disponibilidade</h1>
          </div>
          <p class="text-slate-500 ml-[52px]">Selecione uma área e um dia para ver os horários livres</p>
        </div>

        <div v-if="loadingAreas" class="flex items-center justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>

        <template v-else>
          <!-- Area Selector -->
          <div class="bg-white rounded-2xl p-4 md:p-6 border border-slate-100 shadow-sm mb-6">
            <div class="flex items-center gap-4">
              <div class="flex-1">
                <label class="block text-sm font-medium text-slate-700 mb-1.5">Área Comum</label>
                <select
                  v-model="selectedAreaId"
                  @change="onAreaChange"
                  class="w-full max-w-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  <option value="" disabled>Selecione uma área</option>
                  <option v-for="area in areas" :key="area.id" :value="area.id">
                    {{ area.name }}
                  </option>
                </select>
              </div>

              <div v-if="selectedArea" class="text-sm text-slate-500 flex items-center gap-4">
                <span class="flex items-center gap-1">
                  <span class="material-symbols-outlined text-[16px]">schedule</span>
                  {{ selectedArea.openTime }} - {{ selectedArea.closeTime }}
                </span>
                <span v-if="selectedArea.capacity" class="flex items-center gap-1">
                  <span class="material-symbols-outlined text-[16px]">group</span>
                  {{ selectedArea.capacity }} pessoas
                </span>
              </div>
            </div>
          </div>

          <!-- CTA Card -->
          <div v-if="selectedAreaId" class="bg-gradient-to-r from-primary/5 to-white border border-primary/10 rounded-2xl p-4 mb-6 flex items-center justify-between">
            <div>
              <p class="text-sm font-semibold text-cyan-900">Quer fazer uma reserva?</p>
              <p class="text-xs text-slate-500">Clique em <span class="text-primary font-medium">Reservar</span> ao lado de um horário disponível</p>
            </div>
            <router-link
              :to="{ name: 'resident-reservations-new', query: { areaId: selectedAreaId } }"
              class="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl hover:brightness-90 transition-all text-sm font-semibold"
            >
              <span class="material-symbols-outlined text-[16px]">add_circle</span>
              Nova Reserva
            </router-link>
          </div>

          <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <!-- Calendar -->
            <div class="xl:col-span-2 bg-white rounded-2xl p-4 md:p-6 border border-slate-100 shadow-sm">
              <div class="flex items-center justify-between mb-4">
                <button @click="prevMonth" class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                  <span class="material-symbols-outlined">chevron_left</span>
                </button>
                <span class="font-bold text-cyan-900">{{ monthLabel }}</span>
                <button @click="nextMonth" class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                  <span class="material-symbols-outlined">chevron_right</span>
                </button>
              </div>

              <div class="grid grid-cols-7 gap-1 mb-1">
                <div v-for="day in dayLabels" :key="day" class="text-center text-xs font-semibold text-slate-400 py-1.5">
                  {{ day }}
                </div>
              </div>

              <div class="grid grid-cols-7 gap-1">
                <div
                  v-for="(day, idx) in calendarDays"
                  :key="idx"
                  @click="onDayClick(day)"
                  class="relative rounded-lg flex flex-col items-center justify-center text-sm transition-all cursor-pointer min-h-[44px]"
                  :class="dayCellClass(day)"
                >
                  <span class="font-medium leading-none" :class="dayTextClass(day)">{{ day.number }}</span>
                  <span v-if="day.type === 'current' && !day.past && day.isOperating && selectedAreaId && day.dateStr === selectedDate" class="text-[10px] mt-0.5 font-medium text-white/80">
                    {{ selectedArea?.openTime }}
                  </span>
                </div>
              </div>

              <div v-if="selectedArea" class="mt-4 pt-3 border-t border-slate-100 flex items-center gap-4 text-xs">
                <span class="flex items-center gap-1.5">
                  <span class="w-3 h-3 rounded-sm bg-emerald-400 inline-block"></span>
                  Disponível
                </span>
                <span class="flex items-center gap-1.5">
                  <span class="w-3 h-3 rounded-sm bg-red-400 inline-block"></span>
                  Ocupado
                </span>
                <span class="flex items-center gap-1.5">
                  <span class="w-3 h-3 rounded-sm bg-slate-100 border border-slate-200 inline-block"></span>
                  Fechado
                </span>
                <span class="flex items-center gap-1.5">
                  <span class="w-3 h-3 rounded-sm bg-primary/20 inline-block"></span>
                  Selecionado
                </span>
              </div>
            </div>

            <!-- Result Panel -->
            <div class="bg-white rounded-2xl p-4 md:p-6 border border-slate-100 shadow-sm">
              <template v-if="!selectedAreaId">
                <div class="flex flex-col items-center justify-center h-full py-8 text-center">
                  <span class="material-symbols-outlined text-4xl text-slate-300 mb-3">pin_drop</span>
                  <p class="text-slate-400 text-sm">Escolha uma área comum</p>
                </div>
              </template>

              <template v-else-if="!selectedDate">
                <div class="flex flex-col items-center justify-center h-full py-8 text-center">
                  <span class="material-symbols-outlined text-4xl text-slate-300 mb-3">calendar_month</span>
                  <p class="text-slate-400 text-sm">Clique num dia do calendário</p>
                </div>
              </template>

              <template v-if="checking">
                <div class="flex items-center justify-center py-8">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              </template>

              <template v-if="checkError">
                <div class="text-center py-4">
                  <span class="material-symbols-outlined text-3xl text-red-300 mb-2">error_outline</span>
                  <p class="text-sm text-red-600">{{ checkError }}</p>
                </div>
              </template>

              <template v-if="result">
                <h3 class="font-bold text-cyan-900 text-lg mb-1">{{ formatDate(result.date) }}</h3>
                <p class="text-xs text-slate-400 mb-4">{{ result.openTime }} - {{ result.closeTime }}</p>

                <!-- Status Banner -->
                <div v-if="result.available" class="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-center mb-4">
                  <span class="material-symbols-outlined text-2xl text-emerald-500">check_circle</span>
                  <p class="font-bold text-emerald-800 text-sm">Disponível o dia todo</p>
                </div>
                <div v-else class="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-center mb-4">
                  <span class="material-symbols-outlined text-2xl text-red-400">block</span>
                  <p class="font-bold text-red-800 text-sm">{{ result.conflicts.length }} reserva{{ result.conflicts.length > 1 ? 's' : '' }} no dia</p>
                </div>

                <!-- Timeline -->
                <div class="space-y-1">
                  <div
                    v-for="(slot, idx) in timeSlots"
                    :key="idx"
                    class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm"
                    :class="slot.available ? 'bg-emerald-50/50' : 'bg-red-50/50'"
                  >
                    <span
                      class="material-symbols-outlined text-[18px]"
                      :class="slot.available ? 'text-emerald-400' : 'text-red-400'"
                    >
                      {{ slot.available ? 'check_circle' : 'block' }}
                    </span>
                    <span class="font-medium" :class="slot.available ? 'text-emerald-700' : 'text-red-700'">
                      {{ slot.start }} - {{ slot.end }}
                    </span>
                    <span v-if="!slot.available" class="text-xs text-red-400 ml-auto">
                      {{ statusLabel(slot.status) }}
                    </span>
                    <button
                      v-if="slot.available"
                      @click.stop="goToReservation(slot)"
                      class="ml-auto text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                    >
                      Reservar
                    </button>
                  </div>
                </div>
              </template>
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
import { useRouter, useRoute } from 'vue-router'
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
  operatingDays: number[] | null
  requiresApproval: boolean
  icon: string | null
  isUnderMaintenance: boolean
}

interface Conflict {
  startTime: string
  endTime: string
  status: string
}

interface AvailabilityResult {
  available: boolean
  date: string
  commonAreaId: string
  commonAreaName: string
  openTime: string
  closeTime: string
  startTime?: string
  endTime?: string
  conflicts: Conflict[]
}

interface TimeSlot {
  start: string
  end: string
  available: boolean
  status?: string
}

interface CalendarDay {
  type: 'prev' | 'current' | 'next'
  number: number
  dateStr: string
  isToday: boolean
  past: boolean
  isOperating: boolean
}

const router = useRouter()
const route = useRoute()
const userRole = computed(() => route.path.startsWith('/condominium') ? 'ADMIN' : 'RESIDENT')
const { sidebarOpen, sidebarCollapsed, toggleCollapse } = useSidebar()

const user = authService.getUser()
const userName = ref(user?.name || '')

const areas = ref<CommonArea[]>([])
const loadingAreas = ref(true)
const selectedAreaId = ref('')
const selectedDate = ref('')
const checking = ref(false)
const checkError = ref<string | null>(null)
const result = ref<AvailabilityResult | null>(null)

const currentMonth = ref(new Date().getMonth())
const currentYear = ref(new Date().getFullYear())
const busyDates = ref<Set<string>>(new Set())

const dayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const selectedArea = computed(() => {
  if (!selectedAreaId.value) return null
  return areas.value.find((a) => a.id === selectedAreaId.value) || null
})

const monthLabel = computed(() => {
  const d = new Date(currentYear.value, currentMonth.value, 1)
  return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
})

const operatingDaysSet = computed(() => {
  const area = selectedArea.value
  if (!area?.operatingDays) return new Set<number>()
  const days = Array.isArray(area.operatingDays) ? area.operatingDays : []
  const map: Record<number, number> = { 0: 7, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6 }
  return new Set(days.map((d) => map[d] ?? d))
})

function isTimePast(time: string, date: string): boolean {
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  if (date !== todayStr) return false
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m <= today.getHours() * 60 + today.getMinutes()
}

const timeSlots = computed<TimeSlot[]>(() => {
  if (!result.value) return []
  const { openTime, closeTime, conflicts } = result.value

  const slots: TimeSlot[] = []
  let cursor = openTime

  const sorted = [...conflicts].sort((a, b) => a.startTime.localeCompare(b.startTime))

  for (const c of sorted) {
    if (cursor < c.startTime) {
      const past = isTimePast(cursor, selectedDate.value)
      slots.push({ start: cursor, end: c.startTime, available: !past })
    }
    slots.push({ start: c.startTime, end: c.endTime, available: false, status: c.status })
    cursor = c.endTime > cursor ? c.endTime : cursor
  }

  if (cursor < closeTime) {
    const past = isTimePast(cursor, selectedDate.value)
    slots.push({ start: cursor, end: closeTime, available: !past })
  }

  return slots
})

const calendarDays = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value
  const todayDate = new Date()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startPad = firstDay.getDay()
  const daysInMonth = lastDay.getDate()
  const daysInPrev = new Date(year, month, 0).getDate()

  const days: CalendarDay[] = []

  for (let i = startPad - 1; i >= 0; i--) {
    const dt = new Date(year, month - 1, daysInPrev - i)
    days.push({ type: 'prev', number: daysInPrev - i, dateStr: fmtDate(dt), isToday: false, past: true, isOperating: false })
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dt = new Date(year, month, day)
    const ds = fmtDate(dt)
    const isToday = ds === fmtDate(todayDate)
    const past = dt < new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate())
    const dow = ((dt.getDay() + 6) % 7) + 1
    days.push({ type: 'current', number: day, dateStr: ds, isToday, past, isOperating: operatingDaysSet.value.has(dow) })
  }

  const remaining = 42 - days.length
  for (let day = 1; day <= remaining; day++) {
    const dt = new Date(year, month + 1, day)
    days.push({ type: 'next', number: day, dateStr: fmtDate(dt), isToday: false, past: false, isOperating: false })
  }

  return days
})

function fmtDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function dayCellClass(day: CalendarDay): Record<string, boolean> {
  const isSel = selectedDate.value === day.dateStr
  const isBusy = busyDates.value.has(day.dateStr)
  const isFree = day.type === 'current' && !day.past && day.isOperating && !isBusy

  return {
    'opacity-20 cursor-default': day.type !== 'current' || (day.type === 'current' && day.past),
    'bg-slate-100 text-slate-400 cursor-default': day.type === 'current' && !day.past && !day.isOperating,
    'bg-emerald-400 text-white hover:brightness-110': isFree && !isSel,
    'bg-red-400 text-white hover:brightness-110': isBusy && !isSel,
    'bg-primary text-white ring-2 ring-primary/40': isSel,
  }
}

function dayTextClass(day: CalendarDay): string {
  if (day.dateStr === selectedDate.value) return 'text-white'
  if (day.type === 'current' && !day.past && day.isOperating) return 'text-white'
  return ''
}

function prevMonth() {
  if (currentMonth.value === 0) { currentMonth.value = 11; currentYear.value-- }
  else { currentMonth.value-- }
  if (selectedAreaId.value) fetchBusyDays()
}

function nextMonth() {
  if (currentMonth.value === 11) { currentMonth.value = 0; currentYear.value++ }
  else { currentMonth.value++ }
  if (selectedAreaId.value) fetchBusyDays()
}

function onDayClick(day: CalendarDay) {
  if (day.type !== 'current' || day.past || !day.isOperating || !selectedAreaId.value) return
  selectedDate.value = day.dateStr
  checkAvailability()
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00Z')
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })
}

function statusLabel(status: string): string {
  const map: Record<string, string> = { PENDING: 'Pendente', APPROVED: 'Confirmada', CANCELED: 'Cancelada', REJECTED: 'Rejeitada' }
  return map[status] || status
}

async function fetchBusyDays() {
  if (!selectedAreaId.value) return
  try {
    const res = await http.get(`/common-areas/${selectedAreaId.value}/busy-days`, {
      params: { year: currentYear.value, month: currentMonth.value + 1 },
    })
    busyDates.value = new Set(res.data.data.busyDates)
  } catch {
    busyDates.value = new Set()
  }
}

function onAreaChange() {
  selectedDate.value = ''
  result.value = null
  checkError.value = null
  busyDates.value = new Set()
  fetchBusyDays()
}

async function checkAvailability() {
  checkError.value = null
  result.value = null
  checking.value = true
  try {
    const res = await http.get(`/common-areas/${selectedAreaId.value}/availability`, {
      params: { date: selectedDate.value },
    })
    result.value = res.data.data as AvailabilityResult
  } catch (err: any) {
    checkError.value = err?.response?.data?.message || err?.message || 'Erro ao verificar disponibilidade.'
  } finally {
    checking.value = false
  }
}

async function fetchAreas() {
  loadingAreas.value = true
  try {
    const res = await http.get('/common-areas', { params: { limit: 50 } })
    areas.value = ((res.data.data as any).commonAreas as CommonArea[]).filter((a) => !a.isUnderMaintenance)
  } catch {
    checkError.value = 'Não foi possível carregar as áreas.'
  } finally {
    loadingAreas.value = false
  }
}

function goToReservation(slot: TimeSlot) {
  router.push({
    name: 'resident-reservations-new',
    query: {
      areaId: selectedAreaId.value,
      date: selectedDate.value,
      startTime: slot.start,
      endTime: slot.end,
    },
  })
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
  fetchAreas()
})
</script>

<style scoped>
.material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>
