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

      <div class="flex-1 p-4 md:p-6 lg:p-8 w-full max-w-full">
        <!-- Breadcrumb -->
        <nav class="flex items-center gap-1 text-sm text-slate-500 mb-6 overflow-x-auto">
          <router-link to="/condominium/common-areas" class="hover:text-primary transition-colors whitespace-nowrap">
            Áreas Comuns
          </router-link>
          <span class="material-symbols-outlined text-base">chevron_right</span>
          <span class="text-slate-900 font-medium whitespace-nowrap">{{ isEditMode ? 'Editar' : 'Nova' }}</span>
        </nav>

        <!-- Loading (edit mode) -->
        <div v-if="loading && isEditMode" class="flex items-center justify-center py-20">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>

        <!-- Form -->
        <div v-else class="w-full max-w-4xl mx-auto">
          <div class="bg-surface-container-lowest rounded-2xl p-6 md:p-8 border border-slate-100">
            <h1 class="text-xl md:text-2xl font-bold text-cyan-900 mb-8">
              {{ isEditMode ? 'Editar Área Comum' : 'Nova Área Comum' }}
            </h1>

            <form @submit.prevent="handleSubmit" class="space-y-6">
              <!-- Name -->
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Nome *</label>
                <input
                  v-model="form.name"
                  type="text"
                  maxlength="120"
                  class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  placeholder="Ex: Salão de Festas"
                  required
                />
              </div>

              <!-- Description -->
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Descrição</label>
                <textarea
                  v-model="form.description"
                  rows="3"
                  class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
                  placeholder="Descrição da área..."
                />
              </div>

              <!-- Open/Close time -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Horário de Abertura *</label>
                  <input
                    v-model="form.openTime"
                    type="time"
                    class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    required
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Horário de Fechamento *</label>
                  <input
                    v-model="form.closeTime"
                    type="time"
                    class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    required
                  />
                </div>
              </div>

              <!-- Capacity -->
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Capacidade (pessoas)</label>
                <input
                  v-model="form.capacity"
                  type="number"
                  min="0"
                  max="10000"
                  class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  placeholder="Ex: 50"
                />
              </div>

              <!-- Operating Days -->
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-3">Dias de Funcionamento</label>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="day in DAYS"
                    :key="day.value"
                    type="button"
                    @click="toggleDay(day.value)"
                    :class="['px-3 py-1.5 rounded-lg text-sm font-medium border transition-all', selectedDays.has(day.value) ? 'bg-primary text-white border-primary' : 'bg-white text-slate-600 border-slate-200 hover:border-primary/50']"
                  >
                    {{ day.label }}
                  </button>
                </div>
              </div>

              <!-- Requires Approval -->
              <div class="flex items-center gap-3 p-4 bg-surface-container-low rounded-xl">
                <input
                  v-model="form.requiresApproval"
                  type="checkbox"
                  class="w-5 h-5 rounded-lg border-slate-300 text-primary focus:ring-primary/30"
                />
                <div>
                  <p class="text-sm font-medium text-slate-900">Requer aprovação do administrador</p>
                  <p class="text-xs text-slate-500">Reservas precisarão ser aprovadas manualmente</p>
                </div>
              </div>

              <!-- Icon -->
              <IconPicker v-model="form.icon" />

              <!-- Under Maintenance -->
              <div class="flex items-center gap-3 p-4 bg-surface-container-low rounded-xl">
                <input
                  v-model="form.isUnderMaintenance"
                  type="checkbox"
                  class="w-5 h-5 rounded-lg border-slate-300 text-amber-600 focus:ring-amber-500/30"
                />
                <div>
                  <p class="text-sm font-medium text-slate-900">Em manutenção</p>
                  <p class="text-xs text-slate-500">A área ficará indisponível para reservas dos moradores</p>
                </div>
              </div>

              <!-- Closed Dates (edit only) -->
              <div v-if="isEditMode" class="border-t border-slate-100 pt-6">
                <div class="flex items-center gap-3 mb-4">
                  <div class="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                    <span class="material-symbols-outlined text-[18px] text-red-500">event_busy</span>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-slate-900">Datas Fechadas</p>
                    <p class="text-xs text-slate-500">Dias específicos em que a área não funcionará</p>
                  </div>
                </div>

                <div class="flex items-center gap-2 mb-3">
                  <input
                    v-model="newClosedDate"
                    type="date"
                    class="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                  <button
                    @click="addClosedDate"
                    :disabled="!newClosedDate || closedSaving"
                    class="px-4 py-2 bg-red-500 text-white rounded-xl hover:brightness-90 transition-all text-sm font-medium disabled:opacity-50"
                  >
                    {{ closedSaving ? '...' : 'Fechar' }}
                  </button>
                </div>

                <div v-if="closedDates.length === 0" class="text-sm text-slate-400 py-2">Nenhuma data fechada</div>

                <div v-else class="space-y-1 max-h-48 overflow-y-auto">
                  <div
                    v-for="d in closedDates"
                    :key="d"
                    class="flex items-center justify-between bg-red-50 border border-red-100 rounded-lg px-3 py-1.5"
                  >
                    <span class="text-sm text-red-700">{{ formatClosedDate(d) }}</span>
                    <button
                      @click="removeClosedDate(d)"
                      :disabled="closedSaving"
                      class="text-red-400 hover:text-red-600 transition-colors p-0.5"
                    >
                      <span class="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                </div>

                <p v-if="closedError" class="text-xs text-red-600 mt-2">{{ closedError }}</p>
              </div>

              <!-- Error -->
              <div v-if="submitError" class="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                {{ submitError }}
              </div>

              <!-- Actions -->
              <div class="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  @click="goBack"
                  class="flex-1 px-6 py-3 border border-slate-200 rounded-xl text-slate-600 font-medium hover:bg-slate-50 transition-colors text-center"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  :disabled="saving"
                  class="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:brightness-90 transition-all disabled:opacity-50 text-center"
                >
                  {{ saving ? 'Salvando...' : 'Salvar' }}
                </button>
              </div>
            </form>
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SideNavBar from '@/modules/shared/components/SideNavBar.vue'
import TopAppBar from '@/modules/shared/components/TopAppBar.vue'
import { authService } from '@/modules/auth/services/auth.service'
import { http } from '@/api/http'
import { useSidebar } from '@/modules/shared/composables/useSidebar'
import IconPicker from '@/modules/shared/components/IconPicker.vue'

interface CommonArea {
  id: string
  name: string
  description: string | null
  capacity: number | null
  openTime: string
  closeTime: string
  operatingDays: number[] | string | null
  closedDates: string[] | null
  requiresApproval: boolean
  icon: string | null
  isUnderMaintenance: boolean
}

const DAYS = [
  { value: 1, label: 'Seg' },
  { value: 2, label: 'Ter' },
  { value: 3, label: 'Qua' },
  { value: 4, label: 'Qui' },
  { value: 5, label: 'Sex' },
  { value: 6, label: 'Sáb' },
  { value: 7, label: 'Dom' },
]

const route = useRoute()
const router = useRouter()
const { sidebarOpen, sidebarCollapsed, toggleCollapse } = useSidebar()

const user = authService.getUser()
const userName = ref(user?.name || '')

const areaId = computed(() => route.params.id as string)
const isEditMode = computed(() => !!route.params.id)

const loading = ref(false)
const saving = ref(false)
const submitError = ref<string | null>(null)

const closedDates = ref<string[]>([])
const newClosedDate = ref('')
const closedSaving = ref(false)
const closedError = ref<string | null>(null)

const form = reactive({
  name: '',
  description: '',
  openTime: '08:00',
  closeTime: '22:00',
  capacity: null as number | null,
  requiresApproval: false,
  icon: '',
  isUnderMaintenance: false,
})

const selectedDays = reactive(new Set<number>([1, 2, 3, 4, 5, 6, 7]))

function resetForm() {
  form.name = ''
  form.description = ''
  form.openTime = '08:00'
  form.closeTime = '22:00'
  form.capacity = null
  form.requiresApproval = false
  form.icon = ''
  form.isUnderMaintenance = false
  selectedDays.clear()
  ;[1, 2, 3, 4, 5, 6, 7].forEach((d) => selectedDays.add(d))
  closedDates.value = []
  newClosedDate.value = ''
  submitError.value = null
}

function formatClosedDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00Z')
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

async function addClosedDate() {
  if (!newClosedDate.value || !areaId.value) return
  closedSaving.value = true
  closedError.value = null
  try {
    await http.post(`/common-areas/${areaId.value}/closed-dates`, { date: newClosedDate.value })
    closedDates.value.push(newClosedDate.value)
    closedDates.value.sort()
    newClosedDate.value = ''
  } catch (err: any) {
    closedError.value = err?.response?.data?.message || 'Erro ao fechar data.'
  } finally {
    closedSaving.value = false
  }
}

async function removeClosedDate(date: string) {
  if (!areaId.value) return
  closedSaving.value = true
  closedError.value = null
  try {
    await http.delete(`/common-areas/${areaId.value}/closed-dates`, { data: { date } })
    closedDates.value = closedDates.value.filter((d) => d !== date)
  } catch (err: any) {
    closedError.value = err?.response?.data?.message || 'Erro ao reabrir data.'
  } finally {
    closedSaving.value = false
  }
}

function toggleDay(value: number) {
  if (selectedDays.has(value)) {
    selectedDays.delete(value)
  } else {
    selectedDays.add(value)
  }
}

function getFormattedDays(): string {
  return [...selectedDays].sort((a, b) => a - b).join(',')
}

function parseOperatingDays(days: number[] | string | null): Set<number> {
  const set = new Set<number>()
  if (!days) return set
  if (Array.isArray(days)) {
    days.forEach((d) => set.add(d))
  } else if (typeof days === 'string') {
    days.split(',').forEach((d) => set.add(Number(d.trim())))
  }
  return set
}

async function fetchArea() {
  if (!isEditMode.value) return
  loading.value = true
  try {
    const response = await http.get(`/common-areas/${areaId.value}`)
    const area = response.data.data as CommonArea
    form.name = area.name
    form.description = area.description || ''
    form.openTime = area.openTime
    form.closeTime = area.closeTime
    form.capacity = area.capacity
    form.requiresApproval = area.requiresApproval
    form.icon = area.icon || ''
    form.isUnderMaintenance = area.isUnderMaintenance

    const days = parseOperatingDays(area.operatingDays)
    selectedDays.clear()
    days.forEach((d) => selectedDays.add(d))

    if (Array.isArray(area.closedDates)) {
      closedDates.value = area.closedDates.map(String).sort()
    }
  } catch {
    router.push('/condominium/common-areas')
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  saving.value = true
  submitError.value = null

  const payload: Record<string, any> = {
    name: form.name,
    openTime: form.openTime,
    closeTime: form.closeTime,
    operatingDays: getFormattedDays(),
    requiresApproval: form.requiresApproval,
  }

  if (form.description) payload.description = form.description
  if (form.capacity !== null) payload.capacity = Number(form.capacity)
  if (form.icon) payload.icon = form.icon
  if (form.isUnderMaintenance) payload.isUnderMaintenance = true

  try {
    if (isEditMode.value) {
      await http.patch(`/common-areas/${areaId.value}`, payload)
    } else {
      await http.post('/common-areas', payload)
    }
    router.push('/condominium/common-areas')
  } catch (err: any) {
    submitError.value = err?.response?.data?.message || err?.message || 'Erro ao salvar.'
  } finally {
    saving.value = false
  }
}

const goBack = () => router.push('/condominium/common-areas')

const handleLogout = async () => {
  try { await http.post('/auth/logout') } catch { /* ok */ }
  authService.logout()
  router.push('/')
}

onMounted(() => {
  if (isEditMode.value) fetchArea()
  else resetForm()
})
</script>
