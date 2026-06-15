<template>
  <div class="flex min-h-screen bg-surface text-on-surface">
    <SideNavBar role="ADMIN" :userName="userName" :collapsed="sidebarCollapsed" @toggle-collapse="toggleCollapse" @logout="handleLogout" @cta-click="handleQuickAction" :class="['transition-transform duration-300', sidebarOpen ? 'translate-x-0' : '-translate-x-full', 'fixed z-50', 'md:translate-x-0']" />

    <main :class="['flex-1 flex flex-col min-h-screen w-full transition-all duration-300', sidebarCollapsed ? 'md:ml-16' : 'md:ml-72']">
      <TopAppBar :userName="userName" userRole="ADMIN" @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <div class="flex-1 p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 lg:space-y-8 w-full max-w-full">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-2xl md:text-3xl font-extrabold text-primary tracking-tight font-headline">Blocos</h2>
            <p class="text-on-surface-variant mt-1 md:mt-2 text-sm md:text-base">Gerencie os blocos do condomínio</p>
          </div>
          <router-link to="/condominium/blocks/new" class="w-full sm:w-auto px-4 md:px-6 py-2.5 md:py-3 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-sm md:text-base">
            <span class="material-symbols-outlined text-lg">add</span>
            <span>Novo Bloco</span>
          </router-link>
        </div>

        <div class="bg-surface-container-lowest rounded-2xl md:rounded-3xl overflow-hidden shadow-sm">
          <!-- Loading skeleton -->
          <div v-if="loading" class="hidden md:block p-8">
            <div class="space-y-4">
              <div v-for="n in 4" :key="n" class="flex items-center gap-4 animate-pulse">
                <div class="flex-1 space-y-2">
                  <div class="h-4 bg-slate-200 rounded w-1/3" />
                </div>
                <div class="flex gap-2">
                  <div class="w-8 h-8 bg-slate-200 rounded-lg" />
                  <div class="w-8 h-8 bg-slate-200 rounded-lg" />
                </div>
              </div>
            </div>
          </div>

          <!-- Mobile spinner -->
          <div v-if="loading" class="md:hidden p-8 text-center text-slate-400">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            <p class="mt-2">Carregando...</p>
          </div>

          <div v-if="!loading" class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-surface-container-low">
                <tr>
                  <th class="text-left px-4 md:px-6 py-4 text-sm font-semibold text-slate-600">Nome</th>
                  <th class="text-left px-4 md:px-6 py-4 text-sm font-semibold text-slate-600">Ações</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="block in blocks" :key="block.id" class="hover:bg-white transition-colors">
                  <td class="px-4 md:px-6 py-4">
                    <p class="font-semibold text-cyan-900 text-sm md:text-base">{{ block.name }}</p>
                  </td>
                  <td class="px-4 md:px-6 py-4">
                    <div class="flex items-center gap-1 md:gap-2">
                      <router-link :to="`/condominium/blocks/${block.id}/edit`" class="p-2 text-slate-400 hover:text-primary transition-colors" title="Editar">
                        <span class="material-symbols-outlined">edit</span>
                      </router-link>
                      <button @click="confirmDelete(block)" class="p-2 text-slate-400 hover:text-error transition-colors" title="Remover">
                        <span class="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="blocks.length === 0">
                  <td colspan="2" class="px-4 md:px-6 py-8 text-center text-slate-400">Nenhum bloco encontrado</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <Pagination :current="page" :total-pages="totalPages" @page="goToPage" />
      </div>
    </main>

    <div v-if="sidebarOpen" class="fixed inset-0 bg-black/50 z-40 md:hidden" @click="sidebarOpen = false"></div>

    <div v-if="showDeleteModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <h3 class="text-xl font-bold text-cyan-900 mb-2">Confirmar Remoção</h3>
        <p class="text-slate-600 mb-6">
          Tem certeza que deseja remover o bloco <strong>{{ deletingBlock?.name }}</strong>?
        </p>
        <div class="flex gap-3">
          <button @click="showDeleteModal = false" class="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors">Cancelar</button>
          <button @click="handleDelete" class="flex-1 px-4 py-3 bg-error text-white rounded-xl hover:bg-error/90 transition-colors">Remover</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import SideNavBar from '@/modules/shared/components/SideNavBar.vue'
import TopAppBar from '@/modules/shared/components/TopAppBar.vue'
import Pagination from '@/modules/shared/components/Pagination.vue'
import { authService } from '@/modules/auth/services/auth.service'
import { blocksService } from '../services/blocks.service'
import { http } from '@/api/http'
import { useToast } from '@/modules/shared/composables/useToast'
import { useApiError } from '@/modules/shared/composables/useApiError'
import { useSidebar } from '@/modules/shared/composables/useSidebar'

const router = useRouter()
const { error: showError, success: showSuccess } = useToast()
const { handleError } = useApiError()

const user = authService.getUser()
const userName = ref(user?.name || '')

interface BlockItem {
  id: string
  name: string
}

const { sidebarOpen, sidebarCollapsed, toggleCollapse } = useSidebar()
const blocks = ref<BlockItem[]>([])
const loading = ref(false)
const showDeleteModal = ref(false)
const deletingBlock = ref<BlockItem | null>(null)
const page = ref(1)
const totalPages = ref(1)

async function goToPage(p: number) {
  page.value = p
  await fetchBlocks()
}

const fetchBlocks = async () => {
  try {
    loading.value = true
    const data = await blocksService.getAll(page.value, 10)
    blocks.value = data.blocks || []
    totalPages.value = data.totalPages
  } catch (err) {
    handleError(err, 'Erro ao carregar blocos')
  } finally {
    loading.value = false
  }
}

const confirmDelete = (block: BlockItem) => {
  deletingBlock.value = block
  showDeleteModal.value = true
}

const handleDelete = async () => {
  if (!deletingBlock.value) return
  try {
    await blocksService.delete(deletingBlock.value.id)
    showSuccess('Bloco removido com sucesso')
    showDeleteModal.value = false
    deletingBlock.value = null
    await fetchBlocks()
  } catch (err) {
    handleError(err, 'Erro ao remover bloco')
  }
}

const handleQuickAction = () => {
  router.push('/condominium/blocks/new')
}

const handleLogout = async () => {
  try { await http.post('/auth/logout') } catch {}
  authService.logout()
  router.push('/')
}

onMounted(() => {
  fetchBlocks()
})
</script>

<style scoped>
.font-headline { font-family: 'Manrope', sans-serif; }
.material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
</style>
