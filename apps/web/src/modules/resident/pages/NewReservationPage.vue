<template>
  <div class="flex min-h-screen bg-surface text-on-surface">
    <SideNavBar
      role="RESIDENT"
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
        userRole="RESIDENT"
        @toggle-sidebar="sidebarOpen = !sidebarOpen"
      />

      <div class="flex-1 p-4 md:p-6 lg:p-8">
        <!-- Header -->
        <div class="mb-6 md:mb-8">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <span class="material-symbols-outlined text-primary">add_circle</span>
            </div>
            <h1 class="text-2xl font-bold text-cyan-900">Nova Reserva</h1>
          </div>
          <p class="text-slate-500 ml-[52px]">Selecione área, dia e horário para reservar</p>
        </div>

        <!-- Loading -->
        <div v-if="loadingAreas" class="flex items-center justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>

        <!-- Success -->
        <div v-else-if="success" class="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center max-w-lg mx-auto">
          <div class="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="material-symbols-outlined text-3xl text-emerald-600">check_circle</span>
          </div>
          <h2 class="text-xl font-bold text-emerald-800 mb-2">Reserva Confirmada!</h2>
          <p class="text-emerald-600 mb-6">{{ successArea }} — {{ successDate }} das {{ successStart }} às {{ successEnd }}</p>
          <div class="flex items-center justify-center gap-3">
            <router-link to="/resident/reservations" class="px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:brightness-90 transition-all font-semibold text-sm">Minhas Reservas</router-link>
            <button @click="resetForm" class="px-6 py-2.5 border border-emerald-200 text-emerald-700 rounded-xl hover:bg-emerald-50 transition-all font-medium text-sm">Nova Reserva</button>
          </div>
        </div>

        <template v-else>
          <!-- Area Selector -->
          <div class="bg-white rounded-2xl p-4 md:p-6 border border-slate-100 shadow-sm mb-6">
            <div class="flex items-center gap-4 flex-wrap">
              <div class="flex-1 min-w-[200px]">
                <label class="block text-sm font-medium text-slate-700 mb-1.5">Área Comum</label>
                <select
                  v-model="selectedAreaId"
                  @change="onAreaChange"
                  class="w-full max-w-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  <option value="" disabled>Selecione uma área</option>
                  <option v-for="a in areas" :key="a.id" :value="a.id">{{ a.name }}</option>
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

          <div class="grid grid-cols-1 xl:grid-cols-5 gap-6">
            <!-- Calendar -->
            <div class="xl:col-span-3 bg-white rounded-2xl p-4 md:p-6 border border-slate-100 shadow-sm">
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
                <div v-for="day in dayLabels" :key="day" class="text-center text-xs font-semibold text-slate-400 py-1.5">{{ day }}</div>
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
                </div>
              </div>

              <div v-if="selectedArea" class="mt-4 pt-3 border-t border-slate-100 flex items-center gap-4 text-xs">
                <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-sm bg-emerald-400 inline-block"></span> Disponível</span>
                <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-sm bg-red-400 inline-block"></span> Ocupado</span>
                <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-sm bg-slate-100 border border-slate-200 inline-block"></span> Fechado</span>
                <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-sm bg-primary/20 inline-block"></span> Selecionado</span>
              </div>
            </div>

            <!-- Timeline + Time Picker Panel -->
            <div class="xl:col-span-2 bg-white rounded-2xl p-4 md:p-6 border border-slate-100 shadow-sm">
              <!-- Empty states -->
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

              <!-- Loading -->
              <template v-if="checking">
                <div class="flex items-center justify-center py-8">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              </template>

              <!-- Error -->
              <template v-if="checkError">
                <div class="text-center py-4">
                  <span class="material-symbols-outlined text-3xl text-red-300 mb-2">error_outline</span>
                  <p class="text-sm text-red-600">{{ checkError }}</p>
                </div>
              </template>

              <!-- Result -->
              <template v-if="result">
                <h3 class="font-bold text-cyan-900 text-lg mb-1">{{ formatDate(result.date) }}</h3>
                <p class="text-xs text-slate-400 mb-4">{{ result.openTime }} - {{ result.closeTime }} • {{ result.conflicts.length }} reserva{{ result.conflicts.length !== 1 ? 's' : '' }}</p>

                <!-- Visual Timeline -->
                <div class="relative mb-4 bg-slate-50 rounded-xl p-3">
                  <!-- Time labels + bar -->
                  <div class="flex items-center gap-2 mb-2 text-xs text-slate-400">
                    <span>{{ result.openTime }}</span>
                    <div class="flex-1 h-1.5 bg-slate-200 rounded-full relative overflow-hidden">
                      <!-- Conflict blocks -->
                      <div
                        v-for="(c, idx) in result.conflicts"
                        :key="idx"
                        class="absolute top-0 h-full bg-red-400 rounded-full opacity-80"
                        :style="conflictBarStyle(c)"
                      ></div>
                      <!-- Selected range -->
                      <div
                        v-if="selectedStart && selectedEnd"
                        class="absolute top-0 h-full rounded-full transition-all"
                        :class="rangeValid ? 'bg-emerald-400' : 'bg-red-500'"
                        :style="selectedBarStyle"
                      ></div>
                    </div>
                    <span>{{ result.closeTime }}</span>
                  </div>
                  <!-- Conflict labels -->
                  <div v-for="(c, idx) in result.conflicts" :key="idx" class="text-xs text-red-500 mb-0.5 flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-red-400 inline-block"></span>
                    {{ c.startTime }} - {{ c.endTime }}
                    <span class="text-red-300">({{ statusLabel(c.status) }})</span>
                  </div>
                  <!-- Selected range label -->
                  <div v-if="selectedStart && selectedEnd" class="mt-1 text-xs flex items-center gap-1" :class="rangeValid ? 'text-emerald-600' : 'text-red-600'">
                    <span class="w-1.5 h-1.5 rounded-full inline-block" :class="rangeValid ? 'bg-emerald-400' : 'bg-red-500'"></span>
                    {{ selectedStart }} - {{ selectedEnd }}
                    <span class="font-semibold">{{ rangeValid ? 'Disponível' : 'Conflito' }}</span>
                  </div>
                </div>

                <!-- Time Pickers -->
                <div class="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label class="block text-xs font-medium text-slate-600 mb-1">Início</label>
                    <select
                      v-model="selectedStart"
                      @change="onTimeChange"
                      class="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    >
                      <option value="" disabled>Selecione</option>
                      <option v-for="t in timeOptions" :key="t" :value="t" :disabled="t >= result.closeTime">{{ t }}</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-slate-600 mb-1">Fim</label>
                    <select
                      v-model="selectedEnd"
                      @change="onTimeChange"
                      class="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    >
                      <option value="" disabled>Selecione</option>
                      <option v-for="t in endTimeOptions" :key="t" :value="t">{{ t }}</option>
                    </select>
                  </div>
                </div>

                <!-- Validation messages -->
                <p v-if="selectedStart && !selectedEnd" class="text-xs text-slate-400 mb-3">
                  Mínimo de 2 horas de duração
                </p>
                <p v-if="selectedStart && selectedEnd && !rangeValid" class="text-sm text-red-600 mb-3">
                  Este horário conflita com {{ conflictCount }} reserva{{ conflictCount !== 1 ? 's' : '' }} existente{{ conflictCount !== 1 ? 's' : '' }}
                </p>

                <!-- Confirm Button -->
                <button
                  v-if="rangeValid"
                  @click="showConfirm = true"
                  class="w-full inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl hover:brightness-90 transition-all font-semibold text-sm"
                >
                  <span class="material-symbols-outlined text-[18px]">event_available</span>
                  Reservar {{ selectedStart }} - {{ selectedEnd }}
                </button>
              </template>
            </div>
          </div>

          <!-- Confirm Dialog -->
          <div v-if="showConfirm" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="showConfirm = false">
            <div class="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <span class="material-symbols-outlined text-primary">event_available</span>
                </div>
                <h2 class="text-lg font-bold text-cyan-900">Confirmar Reserva</h2>
              </div>

              <div class="bg-slate-50 rounded-xl p-4 space-y-2 mb-4 text-sm">
                <div class="flex justify-between"><span class="text-slate-500">Área</span><span class="font-medium text-cyan-900">{{ selectedArea?.name }}</span></div>
                <div class="flex justify-between"><span class="text-slate-500">Data</span><span class="font-medium text-cyan-900">{{ formatDate(selectedDate) }}</span></div>
                <div class="flex justify-between"><span class="text-slate-500">Horário</span><span class="font-medium text-cyan-900">{{ selectedStart }} às {{ selectedEnd }}</span></div>
              </div>

              <div class="mb-4">
                <label class="block text-sm font-medium text-slate-700 mb-1">Observações <span class="text-slate-400">(opcional)</span></label>
                <textarea
                  v-model="notes"
                  rows="2"
                  placeholder="Alguma observação para a reserva..."
                  class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                ></textarea>
              </div>

              <p v-if="formError" class="text-sm text-red-600 mb-3">{{ formError }}</p>

              <div class="flex items-center gap-3">
                <button
                  @click="submitReservation"
                  :disabled="submitting"
                  class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl hover:brightness-90 transition-all font-semibold text-sm disabled:opacity-50"
                >
                  <span v-if="submitting" class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                  {{ submitting ? 'Reservando...' : 'Confirmar' }}
                </button>
                <button @click="showConfirm = false" class="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all text-sm font-medium">Cancelar</button>
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
import { ref, computed, watch, onMounted } from 'vue'
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
  operatingDays: number[] | string | null
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
const selectedStart = ref('')
const selectedEnd = ref('')
const showConfirm = ref(false)
const notes = ref('')
const submitting = ref(false)
const formError = ref<string | null>(null)

const success = ref(false)
const successArea = ref('')
const successDate = ref('')
const successStart = ref('')
const successEnd = ref('')

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
  let days: number[] = []
  if (Array.isArray(area.operatingDays)) {
    days = area.operatingDays
  } else if (typeof area.operatingDays === 'string') {
    days = area.operatingDays.split(',').map(Number)
  }
  const map: Record<number, number> = { 0: 7, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6 }
  return new Set(days.map((d) => map[d] ?? d))
})

/** Check if a given time on a given date is already in the past */
function isTimePast(time: string, date: string): boolean {
  const todayStr = fmtDate(new Date())
  if (date !== todayStr) return false
  const now = new Date()
  const [h = 0, m = 0] = time.split(':').map(Number)
  return h * 60 + m <= now.getHours() * 60 + now.getMinutes()
}

/** Generate 30-min time options from openTime to closeTime */
const timeOptions = computed<string[]>(() => {
  if (!result.value) return []
  const times: string[] = []
  const [openH = 0, openM = 0] = result.value.openTime.split(':').map(Number)
  const [closeH = 0, closeM = 0] = result.value.closeTime.split(':').map(Number)
  const start = openH * 60 + openM
  const end = closeH * 60 + closeM
  for (let m = start; m <= end; m += 30) {
    const h = Math.floor(m / 60)
    const min = m % 60
    const t = `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`
    if (!isTimePast(t, selectedDate.value)) {
      times.push(t)
    }
  }
  return times
})

const endTimeOptions = computed<string[]>(() => {
  if (!selectedStart.value) return []
  const [startH = 0, startM = 0] = selectedStart.value.split(':').map(Number)
  const minEnd = startH * 60 + startM + 120
  return timeOptions.value.filter((t) => {
    const [h = 0, m = 0] = t.split(':').map(Number)
    return h * 60 + m >= minEnd
  })
})

const rangeValid = computed(() => {
  if (!selectedStart.value || !selectedEnd.value || !result.value) return false
  if (selectedStart.value >= selectedEnd.value) return false
  const conflicts = result.value.conflicts
  for (const c of conflicts) {
    if (selectedStart.value < c.endTime && selectedEnd.value > c.startTime) return false
  }
  return true
})

const conflictCount = computed(() => {
  if (!selectedStart.value || !selectedEnd.value || !result.value) return 0
  const conflicts = result.value.conflicts
  let count = 0
  for (const c of conflicts) {
    if (selectedStart.value < c.endTime && selectedEnd.value > c.startTime) count++
  }
  return count
})

function timeToPercent(time: string, open: string, close: string): number {
  const toMins = (t: string) => { const [h = 0, m = 0] = t.split(':').map(Number); return h * 60 + m }
  const total = toMins(close) - toMins(open)
  if (total <= 0) return 0
  return ((toMins(time) - toMins(open)) / total) * 100
}

function conflictBarStyle(c: Conflict): Record<string, string> {
  if (!result.value) return {}
  const left = timeToPercent(c.startTime, result.value.openTime, result.value.closeTime)
  const right = timeToPercent(c.endTime, result.value.openTime, result.value.closeTime)
  return { left: `${left}%`, width: `${right - left}%` }
}

const selectedBarStyle = computed(() => {
  if (!result.value || !selectedStart.value || !selectedEnd.value) return {}
  const left = timeToPercent(selectedStart.value, result.value.openTime, result.value.closeTime)
  const right = timeToPercent(selectedEnd.value, result.value.openTime, result.value.closeTime)
  return { left: `${left}%`, width: `${right - left}%` }
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
  selectedStart.value = ''
  selectedEnd.value = ''
  showConfirm.value = false
  notes.value = ''
  checkAvailability()
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00Z')
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })
}

function statusLabel(status?: string): string {
  const map: Record<string, string> = { PENDING: 'Pendente', APPROVED: 'Confirmada', CANCELED: 'Cancelada', REJECTED: 'Rejeitada' }
  return map[status || ''] || status || ''
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
  selectedStart.value = ''
  selectedEnd.value = ''
  showConfirm.value = false
  notes.value = ''
  fetchBusyDays()
}

function onTimeChange() {
  showConfirm.value = false
}

function clearEndIfInvalid() {
  if (!selectedEnd.value) return
  const valid = endTimeOptions.value.find((t) => t === selectedEnd.value)
  if (!valid) selectedEnd.value = ''
}

watch(selectedStart, () => {
  clearEndIfInvalid()
})

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

async function submitReservation() {
  formError.value = null
  submitting.value = true
  try {
    const body = {
      commonAreaId: selectedAreaId.value,
      date: selectedDate.value,
      startTime: selectedStart.value,
      endTime: selectedEnd.value,
      notes: notes.value || undefined,
    }
    const res = await http.post('/reservations', body)
    const data = (res.data as any).data as any

    successArea.value = selectedArea.value?.name || ''
    successDate.value = formatDate(selectedDate.value)
    successStart.value = selectedStart.value
    successEnd.value = selectedEnd.value
    success.value = true
  } catch (err: any) {
    formError.value = err?.response?.data?.message || err?.message || 'Erro ao criar reserva.'
  } finally {
    submitting.value = false
  }
}

function resetForm() {
  selectedAreaId.value = ''
  selectedDate.value = ''
  result.value = null
  selectedStart.value = ''
  selectedEnd.value = ''
  showConfirm.value = false
  notes.value = ''
  formError.value = null
  success.value = false
  busyDates.value = new Set()
}

function applyQueryParams() {
  const q = route.query
  if (q.areaId) selectedAreaId.value = q.areaId as string
  if (q.date) selectedDate.value = q.date as string
  if (q.startTime) selectedStart.value = q.startTime as string
  if (q.endTime) selectedEnd.value = q.endTime as string
  if (selectedAreaId.value && selectedDate.value) {
    setTimeout(() => { fetchBusyDays(); checkAvailability() }, 0)
  }
}

async function fetchAreas() {
  loadingAreas.value = true
  try {
    const res = await http.get('/common-areas', { params: { limit: 50 } })
    areas.value = ((res.data as any).data as any).commonAreas.filter((a: CommonArea) => !a.isUnderMaintenance)
    applyQueryParams()
  } catch {} finally {
    loadingAreas.value = false
  }
}

const handleQuickAction = (actionId: string) => {
  if (actionId === 'new-reservation') {
    resetForm()
    router.push('/resident/reservations/new')
  }
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
