<template>
  <div class="flex min-h-screen bg-surface text-on-surface">
    <SideNavBar
      role="ADMIN"
      :userName="userName"
      :collapsed="sidebarCollapsed"
      @toggle-collapse="toggleCollapse"
      @logout="handleLogout"
      @cta-click="openNewForm"
      :class="['transition-transform duration-300', sidebarOpen ? 'translate-x-0' : '-translate-x-full', 'fixed z-50', 'md:translate-x-0']"
    />
    <main :class="['flex-1 flex flex-col min-h-screen w-full transition-all duration-300', sidebarCollapsed ? 'md:ml-16' : 'md:ml-72']">
      <TopAppBar
        :userName="userName"
        userRole="ADMIN"
        @toggle-sidebar="sidebarOpen = !sidebarOpen"
      />

      <div class="flex-1 p-4 md:p-6 lg:p-8">
        <div class="mb-6 md:mb-8 flex items-center justify-between">
          <div>
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <span class="material-symbols-outlined text-primary">campaign</span>
              </div>
              <h1 class="text-2xl font-bold text-cyan-900">Comunicados</h1>
            </div>
            <p class="text-slate-500 ml-[52px]">Gerencie os comunicados do condomínio</p>
          </div>
          <button
            @click="openNewForm"
            class="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl hover:brightness-90 transition-all font-semibold text-sm"
          >
            <span class="material-symbols-outlined text-[18px]">add</span>
            Novo Comunicado
          </button>
        </div>

        <div v-if="loading" class="flex items-center justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>

        <div v-else-if="errorMessage" class="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3 border border-red-200 max-w-2xl">
          {{ errorMessage }}
        </div>

        <template v-else>
          <div v-if="showForm" class="max-w-2xl mb-8">
            <div class="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm">
              <h2 class="text-lg font-bold text-cyan-900 mb-4">Novo Comunicado</h2>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1.5">Título</label>
                  <input
                    v-model="form.title"
                    type="text"
                    class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="Título do comunicado"
                    maxlength="200"
                  />
                  <p v-if="formError" class="text-xs text-red-500 mt-1">{{ formError }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1.5">Conteúdo</label>
                  <textarea
                    v-model="form.content"
                    rows="4"
                    class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                    placeholder="Escreva o conteúdo do comunicado..."
                  ></textarea>
                </div>
                <div class="flex items-center gap-3 pt-2">
                  <button
                    @click="handleCreate"
                    :disabled="saving"
                    class="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl hover:brightness-90 transition-all font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span v-if="saving" class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                    <span v-else class="material-symbols-outlined text-[18px]">send</span>
                    {{ saving ? 'Enviando...' : 'Enviar Comunicado' }}
                  </button>
                  <button
                    @click="closeForm"
                    class="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all text-sm font-medium"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="announcements.length === 0" class="text-center py-12 text-slate-400">
            <span class="material-symbols-outlined text-4xl mb-2">campaign</span>
            <p>Nenhum comunicado enviado ainda.</p>
          </div>

          <div v-else class="space-y-4 max-w-3xl">
            <div
              v-for="item in announcements"
              :key="item.id"
              class="bg-white rounded-2xl p-5 md:p-6 border border-slate-100 shadow-sm"
            >
              <div class="flex items-start justify-between gap-4">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <h3 class="font-bold text-cyan-900 truncate">{{ item.title }}</h3>
                    <span class="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium shrink-0">Comunicado</span>
                  </div>
                  <p class="text-sm text-slate-600 whitespace-pre-wrap">{{ item.content }}</p>
                  <div class="flex items-center gap-3 mt-3 text-xs text-slate-400">
                    <span>{{ formatDate(item.createdAt) }}</span>
                    <span v-if="item.authorName">por {{ item.authorName }}</span>
                  </div>
                </div>
                <button
                  @click="handleDelete(item.id)"
                  class="shrink-0 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  title="Remover"
                >
                  <span class="material-symbols-outlined text-lg">delete</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Delete Modal -->
          <ConfirmModal
            :show="showDeleteModal"
            title="Remover Comunicado"
            message="Tem certeza que deseja remover este comunicado? Esta ação não pode ser desfeita."
            confirmText="Sim, Remover"
            cancelText="Cancelar"
            :loading="deleting"
            @confirm="confirmDelete"
            @cancel="showDeleteModal = false"
          />

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
import ConfirmModal from '@/modules/shared/components/ConfirmModal.vue'

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
const saving = ref(false)
const errorMessage = ref('')
const formError = ref('')

const announcements = ref<Announcement[]>([])
const currentPage = ref(1)
const totalPages = ref(1)
const showForm = ref(false)

const form = ref({ title: '', content: '' })

function openNewForm() {
  showForm.value = true
  form.value = { title: '', content: '' }
  formError.value = ''
}

function closeForm() {
  showForm.value = false
  form.value = { title: '', content: '' }
  formError.value = ''
}

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

async function handleCreate() {
  formError.value = ''
  if (!form.value.title.trim()) {
    formError.value = 'O título é obrigatório.'
    return
  }
  if (!form.value.content.trim()) {
    formError.value = 'O conteúdo é obrigatório.'
    return
  }

  saving.value = true
  try {
    await http.post('/announcements', {
      title: form.value.title.trim(),
      content: form.value.content.trim(),
    })
    closeForm()
    fetchAnnouncements(1)
  } catch (err: any) {
    formError.value = err?.response?.data?.message || 'Erro ao criar comunicado.'
  } finally {
    saving.value = false
  }
}

const showDeleteModal = ref(false)
const deleteId = ref('')
const deleting = ref(false)

function handleDelete(id: string) {
  deleteId.value = id
  showDeleteModal.value = true
}

async function confirmDelete() {
  deleting.value = true
  try {
    await http.delete(`/announcements/${deleteId.value}`)
    showDeleteModal.value = false
    deleteId.value = ''
    fetchAnnouncements(currentPage.value)
  } catch (err: any) {
    errorMessage.value = err?.response?.data?.message || 'Erro ao remover comunicado.'
    showDeleteModal.value = false
  } finally {
    deleting.value = false
  }
}

function changePage(page: number) {
  if (page < 1 || page > totalPages.value) return
  fetchAnnouncements(page)
}

const handleQuickAction = () => openNewForm()

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
