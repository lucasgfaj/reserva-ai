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

      <div class="flex-1 p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8 lg:space-y-12 w-full max-w-full">
        <WelcomeSection title="Dashboard Principal" :description="welcomeMessage" />

        <!-- Loading skeleton -->
        <div v-if="loadingReservations" class="space-y-6 md:space-y-8">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div v-for="n in 4" :key="n" class="bg-white rounded-2xl p-5 md:p-6 border border-slate-100 shadow-sm animate-pulse">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 bg-slate-200 rounded-xl" />
                <div class="space-y-2 flex-1">
                  <div class="h-3 bg-slate-200 rounded w-1/2" />
                  <div class="h-6 bg-slate-200 rounded w-1/3" />
                </div>
              </div>
              <div class="h-1.5 bg-slate-200 rounded-full" />
            </div>
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
            <div class="col-span-1 lg:col-span-7 space-y-4">
              <div class="h-6 bg-slate-200 rounded w-1/3 mb-2 animate-pulse" />
              <div v-for="n in 3" :key="n" class="bg-white rounded-xl p-4 border border-slate-100 animate-pulse">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-slate-200 rounded-lg" />
                  <div class="flex-1 space-y-2">
                    <div class="h-4 bg-slate-200 rounded w-1/4" />
                    <div class="h-3 bg-slate-200 rounded w-1/2" />
                  </div>
                  <div class="h-5 bg-slate-200 rounded w-16" />
                </div>
              </div>
            </div>
            <div class="col-span-1 lg:col-span-5 space-y-6">
              <div class="bg-white rounded-xl p-5 border border-slate-100 animate-pulse">
                <div class="space-y-3">
                  <div v-for="n in 3" :key="n" class="h-10 bg-slate-200 rounded-lg" />
                </div>
              </div>
              <div class="bg-white rounded-xl p-5 border border-slate-100 animate-pulse">
                <div class="h-5 bg-slate-200 rounded w-1/3 mb-4" />
                <div class="space-y-3">
                  <div v-for="n in 3" :key="n" class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-slate-200 rounded-lg" />
                    <div class="flex-1 space-y-1">
                      <div class="h-3 bg-slate-200 rounded w-1/3" />
                      <div class="h-3 bg-slate-200 rounded w-1/2" />
                    </div>
                    <div class="h-3 bg-slate-200 rounded w-10" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats Cards -->
        <div v-if="!loadingReservations" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatsCard title="Reservas Pendentes" :value="pendingCount" icon="pending_actions" :trend="pendingTrend" variant="primary" />
          <StatsCard title="Total de Moradores" :value="residentCount" icon="group" :subtitle="residentSubtitle" variant="primary" />
          <StatsCard title="Áreas Comuns" :value="areaCount" icon="pool" :subtitle="areaSubtitle" variant="primary" />
          <StatsCard title="Comunicados" :value="announcementCount" icon="campaign" :trend="announcementTrend" variant="primary" />
        </div>

        <!-- Main Grid -->
        <div v-if="!loadingReservations" class="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          <div class="col-span-1 lg:col-span-7 space-y-4 md:space-y-6">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-lg md:text-xl font-bold text-cyan-900 tracking-tight">Próximas Reservas</h3>
              <router-link to="/condominium/reservations" class="text-sm font-semibold text-primary hover:underline">Ver calendário completo</router-link>
            </div>

            <div v-if="upcomingReservations.length === 0" class="text-center py-8 text-slate-400 text-sm">
              Nenhuma reserva futura agendada.
            </div>
            <div v-else class="space-y-3 md:space-y-4">
              <ReservationItem
                v-for="r in upcomingReservations"
                :key="r.id"
                :title="r.commonArea?.name || 'Área Comum'"
                :schedule="r.schedule"
                :resident="r.residentName"
                :status="r.statusLabel"
                :icon="r.commonArea?.icon || 'event'"
              />
            </div>
          </div>

          <div class="col-span-1 lg:col-span-5 space-y-6 md:space-y-8">
            <QuickActions :actions="quickActions" @action="handleQuickAction" />
            <ActivityFeed :activities="activities" />
          </div>
        </div>
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
import WelcomeSection from '@/modules/shared/components/WelcomeSection.vue'
import StatsCard from '@/modules/dashboard/components/StatsCard.vue'
import ReservationItem from '@/modules/dashboard/components/ReservationItem.vue'
import QuickActions from '@/modules/dashboard/components/QuickActions.vue'
import ActivityFeed from '@/modules/dashboard/components/ActivityFeed.vue'
import { authService } from '@/modules/auth/services/auth.service'
import { http } from '@/api/http'
import { useSidebar } from '@/modules/shared/composables/useSidebar'

interface CommonArea {
  id: string
  name: string
  icon: string | null
  capacity: number | null
}

interface Reservation {
  id: string
  startTime: string
  endTime: string
  status: string
  createdAt: string
  commonArea?: CommonArea
  resident?: { user: { name: string } }
}

interface UpcomingReservation {
  id: string
  commonArea?: CommonArea
  schedule: string
  residentName: string
  statusLabel: 'Confirmado' | 'Pendente' | 'Cancelado'
}

const router = useRouter()
const { sidebarOpen, sidebarCollapsed, toggleCollapse } = useSidebar()

const user = authService.getUser()
const userName = ref(user?.name || '')

const condoData = JSON.parse(localStorage.getItem('auth_condo') || '{}')
const condominiumName = ref(condoData.name || '')

const welcomeMessage = computed(() =>
  `Bem-vindo de volta! Aqui está o resumo das atividades do ${condominiumName.value || 'Condomínio'} hoje.`
)

// Stats
const pendingCount = ref(0)
const residentCount = ref(0)
const areaCount = ref(0)
const announcementCount = ref(0)
const pendingTrend = ref('')
const announcementTrend = ref('')
const residentSubtitle = ref('')
const areaSubtitle = ref('')

// Reservations
const loadingReservations = ref(true)
const upcomingReservations = ref<UpcomingReservation[]>([])
const activities = ref<any[]>([])

const quickActions = [
  { id: 'new-communication', label: 'Novo Comunicado', icon: 'campaign', primary: true },
  { id: 'new-resident', label: 'Novo Morador', icon: 'person_add', primary: false },
]

interface ActivityItem {
  id: string
  label: string
  description: string
  time: string
  icon: string
  iconClass: string
  iconBgClass: string
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'agora'
  if (minutes < 60) return `${minutes}min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d`
  return new Date(dateStr).toLocaleDateString('pt-BR')
}

function formatSchedule(start: string, end: string) {
  const s = new Date(start)
  const e = new Date(end)
  const sameDay = s.toDateString() === e.toDateString()
  if (sameDay) {
    return `${s.toLocaleDateString('pt-BR')}, ${s.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - ${e.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
  }
  return `${s.toLocaleDateString('pt-BR')} ${s.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - ${e.toLocaleDateString('pt-BR')} ${e.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
}

const statusLabels: Record<string, 'Confirmado' | 'Pendente' | 'Cancelado'> = {
  APPROVED: 'Confirmado',
  PENDING: 'Pendente',
  REJECTED: 'Cancelado',
  CANCELED: 'Cancelado',
}

async function loadDashboard() {
  try {
    const [pendingRes, residentsRes, areasRes, announcementsRes, upcomingRes, recentResidentsRes] = await Promise.all([
      http.get('/reservations', { params: { status: 'PENDING', limit: 1 } }),
      http.get('/residents', { params: { limit: 1 } }),
      http.get('/common-areas'),
      http.get('/announcements', { params: { limit: 1 } }),
      http.get('/reservations', { params: { limit: 5, from: new Date().toISOString().split('T')[0] } }),
      http.get('/residents', { params: { limit: 5, page: 1 } }),
    ])

    const pendingData = (pendingRes.data as any).data
    const residentsData = (residentsRes.data as any).data
    const areasData = (areasRes.data as any).data
    const announcementsData = (announcementsRes.data as any).data
    const upcomingData = (upcomingRes.data as any).data
    const recentResidentsData = (recentResidentsRes.data as any).data

    pendingCount.value = pendingData.total || 0
    residentCount.value = residentsData.total || 0
    areaCount.value = areasData.commonAreas?.length || 0
    announcementCount.value = announcementsData.total || 0

    pendingTrend.value = pendingCount.value > 0 ? `${pendingCount.value} pendente${pendingCount.value > 1 ? 's' : ''}` : 'Nenhuma'
    announcementTrend.value = announcementCount.value > 0 ? `${announcementCount.value} ativo${announcementCount.value > 1 ? 's' : ''}` : ''
    residentSubtitle.value = `${residentCount.value} morador${residentCount.value > 1 ? 'es' : ''} cadastrado${residentCount.value > 1 ? 's' : ''}`
    areaSubtitle.value = `${areaCount.value} área${areaCount.value > 1 ? 's' : ''} comum${areaCount.value > 1 ? 'ns' : ''}`

    upcomingReservations.value = (upcomingData.reservations || []).map((r: Reservation) => ({
      id: r.id,
      commonArea: r.commonArea,
      schedule: formatSchedule(r.startTime, r.endTime),
      residentName: r.resident?.user?.name || '—',
      statusLabel: statusLabels[r.status] || 'Pendente',
    }))

    // Build activity feed from multiple sources
    const items: ActivityItem[] = []

    const recentReservations = (upcomingData.reservations || []).slice(0, 3)
    for (const r of recentReservations) {
      const label = r.status === 'CANCELED' ? 'Reserva cancelada' : r.status === 'APPROVED' ? 'Reserva confirmada' : 'Nova reserva'
      items.push({
        id: `res-${r.id}`,
        label,
        description: `${r.commonArea?.name || 'Área comum'} - ${r.resident?.user?.name || '—'}`,
        time: timeAgo(r.createdAt || r.startTime),
        icon: r.status === 'CANCELED' ? 'cancel' : r.status === 'APPROVED' ? 'check_circle' : 'event',
        iconClass: r.status === 'CANCELED' ? 'text-red-500' : r.status === 'APPROVED' ? 'text-emerald-500' : 'text-tertiary',
        iconBgClass: r.status === 'CANCELED' ? 'bg-red-50' : r.status === 'APPROVED' ? 'bg-emerald-50' : 'bg-tertiary/10',
      })
    }

    const recentAnnouncements = (announcementsData.announcements || []).slice(0, 3)
    for (const a of recentAnnouncements) {
      items.push({
        id: `ann-${a.id}`,
        label: 'Comunicado publicado',
        description: a.title,
        time: timeAgo(a.createdAt),
        icon: 'campaign',
        iconClass: 'text-primary',
        iconBgClass: 'bg-primary/10',
      })
    }

    if (recentResidentsData?.residents) {
      for (const m of recentResidentsData.residents.slice(0, 3)) {
        items.push({
          id: `res-${m.id}`,
          label: 'Novo morador cadastrado',
          description: m.name,
          time: timeAgo(m.createdAt),
          icon: 'person_add',
          iconClass: 'text-secondary',
          iconBgClass: 'bg-secondary-container/20',
        })
      }
    }

    items.sort((a, b) => {
      const timeA = a.time
      const timeB = b.time
      if (timeA.includes('agora') && !timeB.includes('agora')) return -1
      if (!timeA.includes('agora') && timeB.includes('agora')) return 1
      return 0
    })

    activities.value = items.slice(0, 6)
  } catch {
    // fallback silencioso
  } finally {
    loadingReservations.value = false
  }
}

const handleLogout = async () => {
  try { await http.post('/auth/logout') } catch {}
  authService.logout()
  router.push('/')
}

const handleQuickAction = (actionId: string) => {
  if (actionId === 'new-communication') router.push('/condominium/announcements')
  if (actionId === 'new-resident') router.push('/condominium/residents/new')
}

onMounted(() => {
  loadDashboard()
})
</script>

<style scoped>
.material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
</style>
