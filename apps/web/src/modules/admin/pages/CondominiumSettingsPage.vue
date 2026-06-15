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

      <div class="flex-1 p-4 md:p-6 lg:p-8 w-full max-w-full">
        <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <!-- Header -->
          <div class="px-6 md:px-8 pt-6 md:pt-8 pb-0">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <span class="material-symbols-outlined text-primary">apartment</span>
              </div>
              <div>
                <h1 class="text-2xl font-bold text-cyan-900">Dados do Condomínio</h1>
                <p class="text-sm text-slate-500">Gerencie as informações do seu condomínio</p>
              </div>
            </div>
          </div>

          <!-- Loading skeleton -->
          <div v-if="loading" class="p-6 md:p-8 max-w-xl animate-pulse">
            <div class="space-y-5">
              <div>
                <div class="h-4 bg-slate-200 rounded w-1/4 mb-1.5" />
                <div class="h-10 bg-slate-200 rounded-xl" />
              </div>
              <div>
                <div class="h-4 bg-slate-200 rounded w-1/4 mb-1.5" />
                <div class="h-10 bg-slate-200 rounded-xl" />
              </div>
              <div>
                <div class="h-4 bg-slate-200 rounded w-1/4 mb-1.5" />
                <div class="h-10 bg-slate-200 rounded-xl" />
              </div>
              <div class="flex items-center gap-3 pt-4 border-t border-slate-100">
                <div class="h-11 bg-slate-200 rounded-xl w-36" />
                <div class="h-11 bg-slate-200 rounded-xl w-24" />
              </div>
            </div>
          </div>

          <template v-if="!loading">
            <div class="p-6 md:p-8 max-w-xl">
              <div class="space-y-5">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1.5">Nome do Condomínio</label>
                  <div class="relative">
                    <span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">domain</span>
                    <input
                      v-model="form.name"
                      type="text"
                      class="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      placeholder="Nome do condomínio"
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1.5">Endereço</label>
                  <div class="relative">
                    <span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">location_on</span>
                    <input
                      v-model="form.address"
                      type="text"
                      class="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      placeholder="Endereço completo"
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1.5">Fuso Horário</label>
                  <div class="relative">
                    <span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">schedule</span>
                    <select
                      v-model="form.timezone"
                      class="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
                    >
                      <option value="America/Sao_Paulo">America/Sao_Paulo (UTC-3)</option>
                      <option value="America/Manaus">America/Manaus (UTC-4)</option>
                      <option value="America/Belem">America/Belem (UTC-3)</option>
                      <option value="America/Noronha">America/Noronha (UTC-2)</option>
                      <option value="America/Recife">America/Recife (UTC-3)</option>
                      <option value="America/Bahia">America/Bahia (UTC-3)</option>
                      <option value="America/Cuiaba">America/Cuiaba (UTC-4)</option>
                      <option value="America/Campo_Grande">America/Campo_Grande (UTC-4)</option>
                      <option value="America/Porto_Velho">America/Porto_Velho (UTC-4)</option>
                      <option value="America/Boa_Vista">America/Boa_Vista (UTC-4)</option>
                      <option value="America/Rio_Branco">America/Rio_Branco (UTC-5)</option>
                    </select>
                  </div>
                </div>

                <div class="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <button
                    @click="handleSave"
                    :disabled="saving"
                    class="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl hover:brightness-90 transition-all font-semibold text-sm disabled:opacity-50"
                  >
                    <span v-if="saving" class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                    <span v-else class="material-symbols-outlined text-[18px]">save</span>
                    {{ saving ? 'Salvando...' : 'Salvar Alterações' }}
                  </button>
                  <button
                    @click="resetForm"
                    class="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all text-sm font-medium"
                  >
                    Desfazer
                  </button>
                </div>

                <Transition name="fade">
                  <div v-if="successMessage" class="text-sm text-emerald-700 bg-emerald-50 rounded-xl px-4 py-3 border border-emerald-200 flex items-center gap-2">
                    <span class="material-symbols-outlined text-lg">check_circle</span>
                    {{ successMessage }}
                  </div>
                </Transition>
                <Transition name="fade">
                  <div v-if="errorMessage" class="text-sm text-red-700 bg-red-50 rounded-xl px-4 py-3 border border-red-200 flex items-center gap-2">
                    <span class="material-symbols-outlined text-lg">error</span>
                    {{ errorMessage }}
                  </div>
                </Transition>
              </div>
            </div>
          </template>
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

interface Condominium {
  id: string
  name: string
  address: string
  timezone: string
}

const router = useRouter()
const { sidebarOpen, sidebarCollapsed, toggleCollapse } = useSidebar()

const user = authService.getUser()
const userName = ref(user?.name || '')

const loading = ref(true)
const saving = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const form = ref({
  name: '',
  address: '',
  timezone: 'America/Sao_Paulo',
})

const original = ref<Condominium | null>(null)

function resetForm() {
  if (original.value) {
    form.value.name = original.value.name
    form.value.address = original.value.address
    form.value.timezone = original.value.timezone
  }
  successMessage.value = ''
  errorMessage.value = ''
}

async function fetchCondominium() {
  loading.value = true
  try {
    const res = await http.get('/condominiums')
    const data = (res.data as any).data as Condominium
    original.value = data
    form.value.name = data.name
    form.value.address = data.address
    form.value.timezone = data.timezone
  } catch {
    errorMessage.value = 'Erro ao carregar dados do condomínio.'
  } finally {
    loading.value = false
  }
}

async function handleSave() {
  saving.value = true
  successMessage.value = ''
  errorMessage.value = ''
  try {
    const body: Record<string, string> = {}
    if (form.value.name !== original.value?.name) body.name = form.value.name
    if (form.value.address !== original.value?.address) body.address = form.value.address
    if (form.value.timezone !== original.value?.timezone) body.timezone = form.value.timezone

    if (Object.keys(body).length === 0) {
      successMessage.value = 'Nenhuma alteração para salvar.'
      return
    }

    const res = await http.patch('/condominiums', body)
    const data = (res.data as any).data as Condominium
    original.value = data
    successMessage.value = 'Dados atualizados com sucesso!'
  } catch (err: any) {
    errorMessage.value = err?.response?.data?.message || 'Erro ao salvar dados.'
  } finally {
    saving.value = false
  }
}

const handleQuickAction = () => {}

const handleLogout = () => {
  authService.logout()
  router.push('/')
}

onMounted(() => {
  fetchCondominium()
})
</script>

<style scoped>
.material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
