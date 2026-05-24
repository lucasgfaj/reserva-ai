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
      <!-- TopAppBar with hamburger -->
      <TopAppBar 
        :userName="userName" 
        userRole="ADMIN"
        @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <!-- Form Content -->
      <div class="flex-1 p-4 md:p-6 lg:p-8 w-full max-w-full">
        <!-- Breadcrumb -->
        <nav class="flex items-center gap-1 md:gap-2 text-sm text-slate-500 mb-4 md:mb-6 lg:mb-8 overflow-x-auto">
          <router-link to="/condominium/residents" class="hover:text-primary transition-colors whitespace-nowrap">
            Moradores
          </router-link>
          <span v-if="isEditMode" class="material-symbols-outlined text-base md:text-lg">chevron_right</span>
          <router-link v-if="isEditMode" :to="`/condominium/residents/${residentId}`" class="hover:text-primary transition-colors whitespace-nowrap">
            Detalhes
          </router-link>
          <span class="material-symbols-outlined text-base md:text-lg">chevron_right</span>
          <span class="text-slate-900 font-medium whitespace-nowrap">{{ isEditMode ? 'Editar' : 'Novo' }}</span>
        </nav>

        <!-- Loading State -->
        <div v-if="loading && isEditMode" class="flex items-center justify-center py-12 md:py-20">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>

        <!-- Form -->
        <div v-else class="w-full max-w-4xl mx-auto">
          <div class="bg-surface-container-lowest rounded-2xl md:rounded-3xl p-4 md:p-6 lg:p-8 border border-slate-100">
            <h1 class="text-xl md:text-2xl font-bold text-cyan-900 mb-6 md:mb-8">
              {{ isEditMode ? 'Editar Morador' : 'Cadastrar Novo Morador' }}
            </h1>

            <form @submit.prevent="handleSubmit" class="space-y-5 md:space-y-6">
              <!-- Name -->
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Nome completo *</label>
                <input 
                  v-model="formData.name"
                  type="text"
                  class="w-full px-3 md:px-4 py-2.5 md:py-3 bg-white border border-slate-200 rounded-xl text-sm md:text-base focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  :class="validation.hasError('name') ? 'border-error focus:ring-error/20 focus:border-error' : ''"
                  placeholder="João Silva"
                  required
                />
                <p v-if="validation.hasError('name')" class="text-xs text-error mt-1">{{ validation.getError('name') }}</p>
              </div>

              <!-- Email -->
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">E-mail *</label>
                <input 
                  v-model="formData.email"
                  type="email"
                  class="w-full px-3 md:px-4 py-2.5 md:py-3 bg-white border border-slate-200 rounded-xl text-sm md:text-base focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  :class="validation.hasError('email') ? 'border-error focus:ring-error/20 focus:border-error' : ''"
                  placeholder="joao@reservaai.com.br"
                  required
                  :disabled="isEditMode"
                />
                <p v-if="validation.hasError('email')" class="text-xs text-error mt-1">{{ validation.getError('email') }}</p>
              </div>

              <!-- Unit & Phone - Responsive grid -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Unidade</label>
                  <input 
                    v-model="formData.unit"
                    type="text"
                    class="w-full px-3 md:px-4 py-2.5 md:py-3 bg-white border border-slate-200 rounded-xl text-sm md:text-base focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
placeholder="Ap. 101 - Bloco A"
                />
                <p v-if="validation.hasError('unit')" class="text-xs text-error mt-1">{{ validation.getError('unit') }}</p>
              </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Telefone</label>
                  <input 
                    v-model="formData.phone"
                    type="text"
                    class="w-full px-3 md:px-4 py-2.5 md:py-3 bg-white border border-slate-200 rounded-xl text-sm md:text-base focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    :class="validation.hasError('phone') ? 'border-error focus:ring-error/20 focus:border-error' : ''"
                    placeholder="(11) 99999-9999"
                  />
                  <p v-if="validation.hasError('phone')" class="text-xs text-error mt-1">{{ validation.getError('phone') }}</p>
                </div>
              </div>

              <!-- Password (only for create) -->
              <div v-if="!isEditMode">
                <label class="block text-sm font-medium text-slate-700 mb-2">Senha</label>
                <input 
                  v-model="formData.password"
                  type="password"
                  class="w-full px-3 md:px-4 py-2.5 md:py-3 bg-white border border-slate-200 rounded-xl text-sm md:text-base focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  :class="validation.hasError('password') ? 'border-error focus:ring-error/20 focus:border-error' : ''"
                  placeholder="Mínimo 8 caracteres (deixe vazio para gerar automaticamente)"
                />
                <p class="text-xs text-slate-500 mt-1">A senha deve ter pelo menos uma letra e um número</p>
                <p v-if="validation.hasError('password')" class="text-xs text-error mt-1">{{ validation.getError('password') }}</p>
              </div>

              <!-- CanBook Toggle - RESPONSIVE -->
              <div class="flex items-center justify-between p-4 md:p-5 bg-surface-container-low rounded-xl md:rounded-2xl">
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-slate-900 text-sm md:text-base truncate">Permissão de Reserva</p>
                  <p class="text-sm text-slate-500 hidden sm:block">Define se o morador pode fazer reservas</p>
                </div>
                <button 
                  type="button"
                  @click="formData.canBook = !formData.canBook"
                  :class="['relative flex-shrink-0 w-11 h-6 md:w-14 md:h-7 rounded-full transition-colors', formData.canBook ? 'bg-tertiary' : 'bg-slate-300']"
                >
                  <span 
                    :class="['absolute top-0.5 md:top-1 w-5 h-5 md:w-5 md:h-5 bg-white rounded-full shadow transition-transform', formData.canBook ? 'left-5 md:left-7' : 'left-0.5 md:left-1']"
                  ></span>
                </button>
              </div>

              <!-- Submit & Cancel - STACK on mobile -->
              <div class="flex flex-col sm:flex-row gap-3 md:gap-4 pt-4">
                <button 
                  type="button"
                  @click="goBack"
                  class="flex-1 px-4 md:px-6 py-3 border border-slate-200 rounded-xl text-slate-600 font-medium hover:bg-slate-50 transition-colors text-center"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  :disabled="saving"
                  class="flex-1 px-4 md:px-6 py-3 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 text-center"
                >
                  {{ saving ? 'Salvando...' : 'Salvar' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>

    <!-- Mobile Overlay -->
    <div 
      v-if="sidebarOpen" 
      class="fixed inset-0 bg-black/50 z-40 md:hidden"
      @click="sidebarOpen = false"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SideNavBar from '@/modules/shared/components/SideNavBar.vue'
import TopAppBar from '@/modules/shared/components/TopAppBar.vue'
import { authService } from '@/modules/auth/services/auth.service'
import { residentsService } from '../services/residents.service'
import { http } from '@/api/http'
import { useToast } from '@/modules/shared/composables/useToast'
import { useApiError } from '@/modules/shared/composables/useApiError'
import { useValidation, type ValidationRules } from '@/modules/shared/composables/useValidation'
import { useSidebar } from '@/modules/shared/composables/useSidebar'

const route = useRoute()
const router = useRouter()
const { success: showSuccess, error: showError } = useToast()
const { handleError } = useApiError()
const validation = useValidation()

const user = authService.getUser()
const userName = ref(user?.name || '')

const { sidebarOpen, sidebarCollapsed, toggleCollapse } = useSidebar()

const residentId = computed(() => route.params.id as string)
const isEditMode = computed(() => !!route.params.id)

const loading = ref(false)
const saving = ref(false)

const formData = ref({
  name: '',
  email: '',
  unit: '',
  phone: '',
  password: '',
  canBook: true,
})

const createRules: ValidationRules = {
  name: { required: true, minLength: 3 },
  email: { required: true, email: true },
  unit: { minLength: 3 },
  phone: { minLength: 8 },
  password: { password: true },
}

const fetchResident = async () => {
  if (!isEditMode.value) return
  
  loading.value = true
  try {
    const data = await residentsService.getById(residentId.value)
    formData.value = {
      name: data.name,
      email: data.email,
      unit: data.unit || '',
      phone: data.phone || '',
      password: '',
      canBook: data.canBook,
    }
  } catch (error) {
    console.error('Erro ao carregar morador:', error)
    router.push('/condominium/residents')
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  // Validar campos se não estiver em modo edição
  if (!isEditMode.value) {
    const data = {
      name: formData.value.name,
      email: formData.value.email,
      unit: formData.value.unit,
      phone: formData.value.phone,
      password: formData.value.password,
    }
    const isValid = validation.validate(data, createRules)
    if (!isValid) {
      const firstError = Object.values(validation.errors.value)[0]
      if (firstError) showError(firstError)
      return
    }
  }

  saving.value = true
  try {
    if (isEditMode.value) {
      await residentsService.updatePermissions(residentId.value, formData.value.canBook)
      showSuccess('Morador atualizado com sucesso')
      router.push(`/condominium/residents/${residentId.value}`)
    } else {
      const result = await residentsService.create({
        name: formData.value.name,
        email: formData.value.email,
        unit: formData.value.unit || undefined,
        phone: formData.value.phone || undefined,
        canBook: formData.value.canBook,
        password: formData.value.password || undefined,
      })
      const hasTemp = !formData.value.password
      const msg = hasTemp
        ? `Morador criado com sucesso! Senha temporária: ${result.temporaryPassword}. Repasse ao morador — ele deverá alterá-la no primeiro acesso.`
        : 'Morador criado com sucesso!'
      showSuccess(msg)
      router.push('/condominium/residents')
    }
  } catch (err) {
    handleError(err, 'Erro ao salvar morador')
  } finally {
    saving.value = false
  }
}

const handleQuickAction = () => {
  router.push('/condominium/residents/new')
}

const goBack = () => {
  if (isEditMode.value) {
    router.push(`/condominium/residents/${residentId.value}`)
  } else {
    router.push('/condominium/residents')
  }
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
  if (isEditMode.value) {
    fetchResident()
  }
})
</script>

<style scoped>
.material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>