<template>
  <div class="flex min-h-screen bg-surface text-on-surface">
    <!-- SideNavBar -->
    <SideNavBar 
      role="ADMIN" 
      :userName="userName"
      :collapsed="sidebarCollapsed"
      @toggle-collapse="toggleCollapse"
      @logout="handleLogout"
      @cta-click="handleQuickAction"
      :class="['transition-transform duration-300', sidebarOpen ? 'translate-x-0' : '-translate-x-full', 'fixed z-50', 'md:translate-x-0']" />

    <!-- Main Content Area -->
    <main :class="['flex-1 flex flex-col min-h-screen w-full transition-all duration-300', sidebarCollapsed ? 'md:ml-16' : 'md:ml-72']">
      <!-- TopAppBar -->
      <TopAppBar 
      :userName="userName" 
      userRole="ADMIN"
      @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <!-- Residents Content -->
      <div class="flex-1 p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 lg:space-y-8 w-full max-w-full">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-2xl md:text-3xl font-extrabold text-primary tracking-tight font-headline">Moradores</h2>
            <p class="text-on-surface-variant mt-1 md:mt-2 text-sm md:text-base">Gerencie os moradores do condomínio</p>
          </div>
          <router-link 
            to="/condominium/residents/new"
            class="w-full sm:w-auto px-4 md:px-6 py-2.5 md:py-3 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-sm md:text-base"
          >
            <span class="material-symbols-outlined text-lg">person_add</span>
            <span>Novo Morador</span>
          </router-link>
        </div>

        <!-- Filters -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4">
          <div class="relative w-full sm:max-w-xs">
            <span class="material-symbols-outlined absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input 
              v-model="searchQuery"
              class="w-full pl-10 md:pl-12 pr-4 py-2.5 md:py-3 bg-surface-container-low border-none rounded-xl text-sm md:text-base"
              placeholder="Buscar moradores..." 
              type="text"
            />
          </div>
          <select v-model="filterStatus" class="w-full sm:w-auto px-3 md:px-4 py-2.5 md:py-3 pr-8 md:pr-10 bg-surface-container-low border-none rounded-xl text-sm md:text-base appearance-none">
            <option value="all">Todos</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>
        </div>

        <!-- Residents Table - RESPONSIVE -->
        <div class="bg-surface-container-lowest rounded-2xl md:rounded-3xl overflow-hidden shadow-sm">
          <!-- Loading skeleton -->
          <div v-if="loading" class="hidden md:block p-8">
            <div class="space-y-4">
              <div v-for="n in 4" :key="n" class="flex items-center gap-4 animate-pulse">
                <div class="w-10 h-10 bg-slate-200 rounded-full" />
                <div class="flex-1 space-y-2">
                  <div class="h-4 bg-slate-200 rounded w-1/4" />
                  <div class="h-3 bg-slate-200 rounded w-1/3" />
                </div>
                <div class="h-4 bg-slate-200 rounded w-20" />
                <div class="h-4 bg-slate-200 rounded w-16" />
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

          <!-- Desktop Table -->
          <div v-if="!loading" class="hidden md:block overflow-x-auto">
            <table class="w-full">
              <thead class="bg-surface-container-low">
                <tr>
                  <th class="text-left px-4 md:px-6 py-4 text-sm font-semibold text-slate-600">Morador</th>
                  <th class="text-left px-4 md:px-6 py-4 text-sm font-semibold text-slate-600">Unidade</th>
                  <th class="text-left px-4 md:px-6 py-4 text-sm font-semibold text-slate-600">Contato</th>
                  <th class="text-left px-4 md:px-6 py-4 text-sm font-semibold text-slate-600">Reservas</th>
                  <th class="text-left px-4 md:px-6 py-4 text-sm font-semibold text-slate-600">Ações</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="resident in filteredResidents" :key="resident.id" class="hover:bg-white transition-colors">
                  <td class="px-4 md:px-6 py-4">
                    <router-link :to="`/condominium/residents/${resident.id}`" class="flex items-center gap-3 hover:opacity-80">
                      <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {{ resident.name.charAt(0).toUpperCase() }}
                      </div>
                      <div>
                        <p class="font-semibold text-cyan-900 text-sm md:text-base">{{ resident.name }}</p>
                        <p class="text-sm text-slate-500">{{ resident.email }}</p>
                      </div>
                    </router-link>
                  </td>
                  <td class="px-4 md:px-6 py-4 text-slate-600 text-sm md:text-base">
                    {{ resident.unit || 'Não informada' }}
                  </td>
                  <td class="px-4 md:px-6 py-4 text-slate-600 text-sm md:text-base">
                    {{ resident.phone || '-' }}
                  </td>
                  <td class="px-4 md:px-6 py-4">
                    <button 
                      @click="toggleCanBook(resident)"
                      :class="['px-3 py-1.5 rounded-full text-xs md:text-sm font-semibold', resident.canBook ? 'bg-tertiary-container text-on-tertiary-fixed' : 'bg-slate-200 text-slate-600']"
                    >
                      {{ resident.canBook ? 'Permitido' : 'Bloqueado' }}
                    </button>
                  </td>
                  <td class="px-4 md:px-6 py-4">
                    <div class="flex items-center gap-1 md:gap-2">
                      <router-link 
                        :to="`/condominium/residents/${resident.id}/edit`"
                        class="p-2 text-slate-400 hover:text-primary transition-colors"
                        title="Editar"
                      >
                        <span class="material-symbols-outlined">edit</span>
                      </router-link>
                      <button 
                        @click="confirmDelete(resident)"
                        class="p-2 text-slate-400 hover:text-error transition-colors"
                        title="Inativar"
                      >
                        <span class="material-symbols-outlined">block</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile Cards -->
          <div class="md:hidden divide-y divide-slate-100">
            <div v-if="loading" class="p-8 text-center text-slate-400">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
              <p class="mt-2">Carregando...</p>
            </div>
            <div v-else-if="filteredResidents.length === 0" class="p-8 text-center text-slate-400">
              <span class="material-symbols-outlined text-5xl">group_remove</span>
              <p class="mt-2">Nenhum morador encontrado</p>
            </div>
            <div v-else v-for="resident in filteredResidents" :key="resident.id" class="p-4 hover:bg-white transition-colors">
              <router-link :to="`/condominium/residents/${resident.id}`" class="flex items-start gap-3">
                <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold flex-shrink-0">
                  {{ resident.name.charAt(0).toUpperCase() }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-semibold text-cyan-900">{{ resident.name }}</p>
                  <p class="text-sm text-slate-500 truncate">{{ resident.email }}</p>
                  <p class="text-sm text-slate-500">{{ resident.unit || 'Sem unidade' }} • {{ resident.phone || 'Sem telefone' }}</p>
                </div>
                <button 
                  @click.prevent="toggleCanBook(resident)"
                  :class="['px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0', resident.canBook ? 'bg-tertiary-container text-on-tertiary-fixed' : 'bg-slate-200 text-slate-600']"
                >
                  {{ resident.canBook ? '✓' : '✗' }}
                </button>
              </router-link>
              <div class="flex items-center gap-2 mt-3 ml-15">
                <router-link 
                  :to="`/condominium/residents/${resident.id}/edit`"
                  class="flex-1 py-2 text-center text-sm text-slate-600 hover:text-primary border border-slate-200 rounded-lg"
                >
                  Editar
                </router-link>
                <button 
                  @click.prevent="confirmDelete(resident)"
                  class="flex-1 py-2 text-center text-sm text-error hover:bg-error/5 border border-error/20 rounded-lg"
                >
                  Inativar
                </button>
              </div>
            </div>
          </div>
        </div>

        <Pagination :current="page" :total-pages="totalPages" @page="goToPage" />
      </div>
    </main>

    <!-- Mobile Overlay -->
    <div 
      v-if="sidebarOpen" 
      class="fixed inset-0 bg-black/50 z-40 md:hidden"
      @click="sidebarOpen = false"
    ></div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <h3 class="text-xl font-bold text-cyan-900 mb-2">Confirmar Inativação</h3>
        <p class="text-slate-600 mb-6">
          Tem certeza que deseja inativar o morador <strong>{{ deletingResident?.name }}</strong>?
        </p>
        <div class="flex gap-3">
          <button 
            @click="showDeleteModal = false"
            class="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button 
            @click="handleDelete"
            class="flex-1 px-4 py-3 bg-error text-white rounded-xl hover:bg-error/90 transition-colors"
          >
            Inativar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import SideNavBar from '@/modules/shared/components/SideNavBar.vue'
import TopAppBar from '@/modules/shared/components/TopAppBar.vue'
import Pagination from '@/modules/shared/components/Pagination.vue'
import { authService } from '@/modules/auth/services/auth.service'
import { residentsService } from '../services/residents.service'
import { http } from '@/api/http'
import { useToast } from '@/modules/shared/composables/useToast'
import { useApiError } from '@/modules/shared/composables/useApiError'
import { useSidebar } from '@/modules/shared/composables/useSidebar'

const router = useRouter()
const { error: showError, success: showSuccess } = useToast()
const { handleError } = useApiError()

const user = authService.getUser()
const userName = ref(user?.name || '')

interface Resident {
  id: string
  name: string
  email: string
  unit?: string
  phone?: string
  canBook: boolean
}

const { sidebarOpen, sidebarCollapsed, toggleCollapse } = useSidebar()
const residents = ref<Resident[]>([])
const loading = ref(false)
const searchQuery = ref('')
const filterStatus = ref('all')
const showDeleteModal = ref(false)
const deletingResident = ref<Resident | null>(null)
const page = ref(1)
const totalPages = ref(1)

const filteredResidents = computed(() => {
  let result = residents.value
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(r => 
      r.name.toLowerCase().includes(query) || 
      r.email.toLowerCase().includes(query)
    )
  }
  
  return result
})

async function goToPage(p: number) {
  page.value = p
  await fetchResidents()
}

const fetchResidents = async () => {
  try {
    loading.value = true
    const data = await residentsService.getAll(page.value, 5)
    residents.value = data.residents || []
    totalPages.value = data.totalPages
  } catch (err) {
    handleError(err, 'Erro ao carregar moradores')
  } finally {
    loading.value = false
  }
}

const toggleCanBook = async (resident: Resident) => {
  try {
    await residentsService.updatePermissions(resident.id, !resident.canBook)
    resident.canBook = !resident.canBook
    showSuccess(resident.canBook ? 'Permissão de reserva concedida' : 'Reserva bloqueada')
  } catch (err) {
    handleError(err, 'Erro ao alterar permissão')
  }
}

const confirmDelete = (resident: Resident) => {
  deletingResident.value = resident
  showDeleteModal.value = true
}

const handleDelete = async () => {
  if (!deletingResident.value) return
  console.log('Inativar morador:', deletingResident.value.id)
  showSuccess('Morador inativado com sucesso')
  showDeleteModal.value = false
  deletingResident.value = null
}

const handleQuickAction = () => {
  router.push('/condominium/residents/new')
}

const handleLogout = async () => {
  try {
    await http.post('/auth/logout')
  } catch {
    // Ignora erro
  }
  authService.logout()
  router.push('/')
}


onMounted(() => {
  fetchResidents()
})
</script>

<style scoped>
.font-headline { font-family: 'Manrope', sans-serif; }
.font-body { font-family: 'Inter', sans-serif; }
.material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>