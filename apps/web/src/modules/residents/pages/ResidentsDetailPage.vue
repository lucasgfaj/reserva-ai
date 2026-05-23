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

      <!-- Detail Content -->
      <div class="flex-1 p-4 md:p-6 lg:p-8 w-full max-w-full">
        <!-- Breadcrumb -->
        <nav class="flex items-center gap-1 md:gap-2 text-sm text-slate-500 mb-4 md:mb-6 lg:mb-8 overflow-x-auto">
          <router-link to="/condominium/residents" class="hover:text-primary transition-colors whitespace-nowrap">
            Moradores
          </router-link>
          <span class="material-symbols-outlined text-base md:text-lg">chevron_right</span>
          <span class="text-slate-900 font-medium whitespace-nowrap">Detalhes</span>
        </nav>

        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center py-12 md:py-20">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>

        <!-- Content -->
        <div v-else-if="resident" class="w-full max-w-5xl mx-auto space-y-4 md:space-y-6 lg:space-y-8">
          <!-- Header -->
          <div class="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div class="flex items-center gap-4 md:gap-6">
              <div class="w-14 h-14 md:w-16 lg:w-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-xl md:text-2xl lg:text-3xl font-bold">
                {{ resident.name.charAt(0).toUpperCase() }}
              </div>
              <div>
                <h1 class="text-xl md:text-2xl lg:text-3xl font-bold text-cyan-900">{{ resident.name }}</h1>
                <p class="text-slate-500 mt-1 text-sm md:text-base">{{ resident.email }}</p>
              </div>
            </div>
            <div class="flex flex-wrap items-center gap-2 md:gap-3 w-full sm:w-auto">
              <router-link 
                :to="`/condominium/residents/${resident.id}/edit`"
                class="flex-1 sm:flex-none px-4 md:px-5 py-2.5 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-sm md:text-base"
              >
                <span class="material-symbols-outlined text-lg">edit</span>
                <span class="hidden sm:inline">Editar</span>
              </router-link>
              <button 
                @click="goBack"
                class="flex-1 sm:flex-none px-4 md:px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors text-sm md:text-base"
              >
                Voltar
              </button>
            </div>
          </div>

          <!-- Cards Grid - RESPONSIVE -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <!-- Info Card -->
            <div class="bg-surface-container-lowest rounded-2xl md:rounded-3xl p-4 md:p-6 lg:p-8 border border-slate-100">
              <div class="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                <span class="material-symbols-outlined text-slate-400">person</span>
                <h3 class="text-base md:text-lg font-semibold text-cyan-900">Informações Pessoais</h3>
              </div>
              
              <div class="space-y-4 md:space-y-5">
                <div>
                  <p class="text-sm text-slate-500 mb-1">Nome completo</p>
                  <p class="font-medium text-cyan-900 text-sm md:text-base">{{ resident.name }}</p>
                </div>
                <div>
                  <p class="text-sm text-slate-500 mb-1">E-mail</p>
                  <p class="font-medium text-cyan-900 text-sm md:text-base break-all">{{ resident.email }}</p>
                </div>
                <div>
                  <p class="text-sm text-slate-500 mb-1">Telefone</p>
                  <p class="font-medium text-cyan-900 text-sm md:text-base">{{ resident.phone || 'Não cadastrado' }}</p>
                </div>
              </div>
            </div>

            <!-- Unit Card -->
            <div class="bg-surface-container-lowest rounded-2xl md:rounded-3xl p-4 md:p-6 lg:p-8 border border-slate-100">
              <div class="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                <span class="material-symbols-outlined text-slate-400">home</span>
                <h3 class="text-base md:text-lg font-semibold text-cyan-900">Unidade</h3>
              </div>
              
              <div class="space-y-4 md:space-y-5">
                <div>
                  <p class="text-sm text-slate-500 mb-1">Unidade</p>
                  <p class="font-medium text-cyan-900 text-sm md:text-base">{{ resident.unit || 'Não informada' }}</p>
                </div>
                <div>
                  <p class="text-sm text-slate-500 mb-1">ID do morador</p>
                  <p class="font-mono text-xs md:text-sm text-slate-600 break-all">{{ resident.id }}</p>
                </div>
              </div>
            </div>

            <!-- Permissions Card - RESPONSIVE -->
            <div class="bg-surface-container-lowest rounded-2xl md:rounded-3xl p-4 md:p-6 lg:p-8 border border-slate-100 md:col-span-2">
              <div class="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                <span class="material-symbols-outlined text-slate-400">event_available</span>
                <h3 class="text-base md:text-lg font-semibold text-cyan-900">Permissões de Reserva</h3>
              </div>
              
              <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div class="flex items-center gap-3">
                  <span :class="['w-2.5 h-2.5 rounded-full flex-shrink-0', resident.canBook ? 'bg-tertiary' : 'bg-slate-400']"></span>
                  <p class="font-medium text-cyan-900 text-sm md:text-base">
                    {{ resident.canBook ? 'Pode fazer reservas' : 'Reservas bloqueadas' }}
                  </p>
                </div>
                <button 
                  @click="toggleCanBook"
                  :disabled="updatingPermission"
                  class="px-4 md:px-6 py-2.5 rounded-xl font-medium transition-colors text-sm md:text-base disabled:opacity-50"
                  :class="resident.canBook ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-tertiary text-white hover:opacity-90'"
                >
                  {{ updatingPermission ? '...' : resident.canBook ? 'Bloquear' : 'Permitir' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Danger Zone -->
          <div class="bg-error-container/10 rounded-2xl md:rounded-3xl p-4 md:p-6 lg:p-8 border border-error/20">
            <div class="flex items-center gap-2 md:gap-3 mb-4">
              <span class="material-symbols-outlined text-error">warning</span>
              <h3 class="text-base md:text-lg font-semibold text-error">Zona de Perigo</h3>
            </div>
            <p class="text-slate-600 mb-4 text-sm md:text-base">
              Inativar este morador impedirá ele de acessar o sistema e fazer reservas.
            </p>
            <button 
              @click="confirmDelete"
              class="px-4 md:px-6 py-2.5 bg-error text-white rounded-xl font-medium hover:bg-error/90 transition-colors text-sm md:text-base"
            >
              Inativar Morador
            </button>
          </div>
        </div>

        <!-- Not Found -->
        <div v-else class="text-center py-12 md:py-20">
          <span class="material-symbols-outlined text-5xl md:text-6xl text-slate-300">person_off</span>
          <h2 class="text-lg md:text-xl font-bold text-slate-600 mt-4">Morador não encontrado</h2>
          <router-link to="/condominium/residents" class="text-primary hover:underline mt-2 inline-block">
            Voltar para lista
          </router-link>
        </div>
      </div>
    </main>

    <!-- Mobile Overlay -->
    <div 
      v-if="sidebarOpen" 
      class="fixed inset-0 bg-black/50 z-40 md:hidden"
      @click="sidebarOpen = false"
    ></div>

    <!-- Delete Confirmation Modal - RESPONSIVE -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl p-6 md:p-8 w-full max-w-sm shadow-2xl">
        <h3 class="text-xl font-bold text-cyan-900 mb-2">Confirmar Inativação</h3>
        <p class="text-slate-600 mb-6 text-sm md:text-base">
          Tem certeza que deseja inativar <strong>{{ resident?.name }}</strong>? Esta ação pode ser revertida.
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
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SideNavBar from '@/modules/shared/components/SideNavBar.vue'
import TopAppBar from '@/modules/shared/components/TopAppBar.vue'
import { authService } from '@/modules/auth/services/auth.service'
import { residentsService } from '../services/residents.service'
import { http } from '@/api/http'
import { useToast } from '@/modules/shared/composables/useToast'
import { useApiError } from '@/modules/shared/composables/useApiError'
import { useSidebar } from '@/modules/shared/composables/useSidebar'

const route = useRoute()
const router = useRouter()
const { error: showError, success: showSuccess } = useToast()
const { handleError } = useApiError()

interface Resident {
  id: string
  name: string
  email: string
  unit?: string
  phone?: string
  canBook: boolean
}

const user = authService.getUser()
const userName = ref(user?.name || '')

const { sidebarOpen, sidebarCollapsed, toggleCollapse } = useSidebar()
const resident = ref<Resident | null>(null)
const loading = ref(true)
const showDeleteModal = ref(false)
const updatingPermission = ref(false)

const fetchResident = async () => {
  loading.value = true
  try {
    const data = await residentsService.getById(route.params.id as string)
    resident.value = data
  } catch (error) {
    console.error('Erro ao carregar morador:', error)
    resident.value = null
  } finally {
    loading.value = false
  }
}

const toggleCanBook = async () => {
  if (!resident.value || updatingPermission.value) return
  
  updatingPermission.value = true
  try {
    const newValue = !resident.value.canBook
    await residentsService.updatePermissions(resident.value.id, newValue)
    resident.value.canBook = newValue
    showSuccess(newValue ? 'Reserva permitida' : 'Reserva bloqueada')
  } catch (err) {
    handleError(err, 'Erro ao alterar permissão')
  } finally {
    updatingPermission.value = false
  }
}

const confirmDelete = () => {
  showDeleteModal.value = true
}

const handleDelete = async () => {
  if (!resident.value) return
  console.log('Inativar morador:', resident.value.id)
  showDeleteModal.value = false
}

const handleQuickAction = () => {
  router.push('/condominium/residents/new')
}

const goBack = () => {
  router.push('/condominium/residents')
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
  fetchResident()
})
</script>

<style scoped>
.material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>