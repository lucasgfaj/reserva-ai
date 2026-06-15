<template>
  <div class="flex min-h-screen bg-surface text-on-surface">
    <SideNavBar role="ADMIN" :userName="userName" :collapsed="sidebarCollapsed" @toggle-collapse="toggleCollapse" @logout="handleLogout" @cta-click="handleQuickAction" :class="['transition-transform duration-300', sidebarOpen ? 'translate-x-0' : '-translate-x-full', 'fixed z-50', 'md:translate-x-0']" />

    <main :class="['flex-1 flex flex-col min-h-screen w-full transition-all duration-300', sidebarCollapsed ? 'md:ml-16' : 'md:ml-72']">
      <TopAppBar :userName="userName" userRole="ADMIN" @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <div class="flex-1 p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 lg:space-y-8 w-full max-w-full">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-2xl md:text-3xl font-extrabold text-primary tracking-tight font-headline">Unidades</h2>
            <p class="text-on-surface-variant mt-1 md:mt-2 text-sm md:text-base">Gerencie as unidades do condomínio</p>
          </div>
          <router-link to="/condominium/units/new" class="w-full sm:w-auto px-4 md:px-6 py-2.5 md:py-3 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-sm md:text-base">
            <span class="material-symbols-outlined text-lg">add</span>
            <span>Nova Unidade</span>
          </router-link>
        </div>

        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4">
          <select v-model="filterBlockId" class="w-full sm:w-auto px-3 md:px-4 py-2.5 md:py-3 bg-surface-container-low border-none rounded-xl text-sm md:text-base" style="padding-right: 2.5rem;">
            <option value="">Todos os blocos</option>
            <option v-for="block in blocks" :key="block.id" :value="block.id">{{ block.name }}</option>
          </select>
        </div>

        <div class="bg-surface-container-lowest rounded-2xl md:rounded-3xl overflow-hidden shadow-sm">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-surface-container-low">
                <tr>
                  <th class="text-left px-4 md:px-6 py-4 text-sm font-semibold text-slate-600">Número</th>
                  <th class="text-left px-4 md:px-6 py-4 text-sm font-semibold text-slate-600">Bloco</th>
                  <th class="text-left px-4 md:px-6 py-4 text-sm font-semibold text-slate-600">Ações</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="unit in units" :key="unit.id" class="hover:bg-white transition-colors">
                  <td class="px-4 md:px-6 py-4">
                    <p class="font-semibold text-cyan-900 text-sm md:text-base">{{ unit.number }}</p>
                  </td>
                  <td class="px-4 md:px-6 py-4 text-slate-600 text-sm md:text-base">{{ unit.blockName || '—' }}</td>
                  <td class="px-4 md:px-6 py-4">
                    <div class="flex items-center gap-1 md:gap-2">
                      <router-link :to="`/condominium/units/${unit.id}/edit`" class="p-2 text-slate-400 hover:text-primary transition-colors" title="Editar">
                        <span class="material-symbols-outlined">edit</span>
                      </router-link>
                      <button @click="confirmDelete(unit)" class="p-2 text-slate-400 hover:text-error transition-colors" title="Remover">
                        <span class="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="units.length === 0">
                  <td colspan="3" class="px-4 md:px-6 py-8 text-center text-slate-400">Nenhuma unidade encontrada</td>
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
          Tem certeza que deseja remover a unidade <strong>{{ deletingUnit?.number }}</strong>?
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
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import SideNavBar from '@/modules/shared/components/SideNavBar.vue'
import TopAppBar from '@/modules/shared/components/TopAppBar.vue'
import Pagination from '@/modules/shared/components/Pagination.vue'
import { authService } from '@/modules/auth/services/auth.service'
import { blocksService } from '@/modules/blocks/services/blocks.service'
import { unitsService } from '../services/units.service'
import { http } from '@/api/http'
import { useToast } from '@/modules/shared/composables/useToast'
import { useApiError } from '@/modules/shared/composables/useApiError'
import { useSidebar } from '@/modules/shared/composables/useSidebar'

const router = useRouter()
const { error: showError, success: showSuccess } = useToast()
const { handleError } = useApiError()

const user = authService.getUser()
const userName = ref(user?.name || '')

interface UnitItem {
  id: string
  number: string
  blockId: string
  blockName?: string
}

interface BlockItem {
  id: string
  name: string
}

const { sidebarOpen, sidebarCollapsed, toggleCollapse } = useSidebar()
const units = ref<UnitItem[]>([])
const blocks = ref<BlockItem[]>([])
const loading = ref(false)
const showDeleteModal = ref(false)
const deletingUnit = ref<UnitItem | null>(null)
const page = ref(1)
const totalPages = ref(1)
const filterBlockId = ref('')

watch(filterBlockId, () => {
  page.value = 1
  fetchUnits()
})

async function goToPage(p: number) {
  page.value = p
  await fetchUnits()
}

const fetchBlocks = async () => {
  try {
    const data = await blocksService.getAll(1, 100)
    blocks.value = data.blocks || []
  } catch {}
}

const fetchUnits = async () => {
  try {
    loading.value = true
    const data = await unitsService.getAll(page.value, 10, filterBlockId.value || undefined)
    units.value = data.units || []
    totalPages.value = data.totalPages
  } catch (err) {
    handleError(err, 'Erro ao carregar unidades')
  } finally {
    loading.value = false
  }
}

const confirmDelete = (unit: UnitItem) => {
  deletingUnit.value = unit
  showDeleteModal.value = true
}

const handleDelete = async () => {
  if (!deletingUnit.value) return
  try {
    await unitsService.delete(deletingUnit.value.id)
    showSuccess('Unidade removida com sucesso')
    showDeleteModal.value = false
    deletingUnit.value = null
    await fetchUnits()
  } catch (err) {
    handleError(err, 'Erro ao remover unidade')
  }
}

const handleQuickAction = () => {
  router.push('/condominium/units/new')
}

const handleLogout = async () => {
  try { await http.post('/auth/logout') } catch {}
  authService.logout()
  router.push('/')
}

onMounted(() => {
  fetchBlocks()
  fetchUnits()
})
</script>

<style scoped>
.font-headline { font-family: 'Manrope', sans-serif; }
.material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
</style>
