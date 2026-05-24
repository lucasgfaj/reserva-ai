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
        <div class="mb-6 md:mb-8">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <span class="material-symbols-outlined text-primary">campaign</span>
            </div>
            <h1 class="text-2xl font-bold text-cyan-900">Comunicados</h1>
          </div>
          <p class="text-slate-500 ml-[52px]">Avisos e comunicados do condomínio</p>
        </div>

        <div v-if="loading" class="flex items-center justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>

        <div v-else-if="errorMessage" class="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3 border border-red-200 max-w-2xl">
          {{ errorMessage }}
        </div>

        <div v-else-if="announcements.length === 0" class="text-center py-12 text-slate-400">
          <span class="material-symbols-outlined text-4xl mb-2">campaign</span>
          <p>Nenhum comunicado publicado.</p>
        </div>

        <div v-else class="space-y-4 max-w-3xl">
          <div
            v-for="item in announcements"
            :key="item.id"
            class="bg-white rounded-2xl p-5 md:p-6 border border-slate-100 shadow-sm"
          >
            <div class="flex items-start gap-4">
              <div class="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <span class="material-symbols-outlined text-primary text-lg">campaign</span>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-bold text-cyan-900">{{ item.title }}</h3>
                <p class="text-sm text-slate-600 mt-2 whitespace-pre-wrap">{{ item.content }}</p>
                <div class="flex items-center gap-3 mt-3 text-xs text-slate-400">
                  <span>{{ formatDate(item.createdAt) }}</span>
                  <span v-if="item.authorName">por {{ item.authorName }}</span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-8">
            <button
              @click="changePage(currentPage - 1)"
              :disabled="currentPage <= 1"
              class="px-3 py-1.5 border border-slate-200 rounded-lg text-sm disabled:opacity-50 hover:bg-slate-50 transition-all"
            >
              Anterior
            </button>
            <span class="text-sm text-slate-500">Página {{ currentPage }} de {{ totalPages }}</span>
            <button
              @click="changePage(currentPage + 1)"
              :disabled="currentPage >= totalPages"
              class="px-3 py-1.5 border border-slate-200 rounded-lg text-sm disabled:opacity-50 hover:bg-slate-50 transition-all"
            >
              Próxima
            </button>
          </div>
        </div>
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

interface Announcement {
  id: string
  title: string
  content: string
  authorName?: string
  createdAt: string
}

interface ListResponse {
  announcements: Announcement[]
  total: number
  page: number
  limit: number
  totalPages: number
}

const router = useRouter()
const { sidebarOpen, sidebarCollapsed, toggleCollapse } = useSidebar()

const user = authService.getUser()
const userName = ref(user?.name || '')

const loading = ref(true)
const errorMessage = ref('')

const announcements = ref<Announcement[]>([])
const currentPage = ref(1)
const totalPages = ref(1)

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

async function fetchAnnouncements(page = 1) {
  loading.value = true
  errorMessage.value = ''
  try {
    const res = await http.get('/announcements', { params: { page, limit: 20 } })
    const data = (res.data as any).data as ListResponse
    announcements.value = data.announcements
    currentPage.value = data.page
    totalPages.value = data.totalPages
  } catch (err: any) {
    errorMessage.value = err?.response?.data?.message || 'Erro ao carregar comunicados.'
  } finally {
    loading.value = false
  }
}

function changePage(page: number) {
  if (page < 1 || page > totalPages.value) return
  fetchAnnouncements(page)
}

const handleQuickAction = () => {
  router.push('/resident/reservations/new')
}

const handleLogout = async () => {
  try { await http.post('/auth/logout') } catch {}
  authService.logout()
  router.push('/')
}

onMounted(() => {
  fetchAnnouncements()
})
</script>

<style scoped>
.material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>
