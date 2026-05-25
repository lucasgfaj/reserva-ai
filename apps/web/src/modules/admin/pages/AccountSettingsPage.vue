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
                <span class="material-symbols-outlined text-primary">manage_accounts</span>
              </div>
              <div>
                <h1 class="text-2xl font-bold text-cyan-900">Minha Conta</h1>
                <p class="text-sm text-slate-500">Gerencie suas informações e segurança</p>
              </div>
            </div>
          </div>

          <!-- Tabs -->
          <div class="px-6 md:px-8 pt-6">
            <div class="flex bg-slate-100 rounded-xl p-1 w-full md:w-fit overflow-x-auto">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                @click="activeTab = tab.id"
                :class="[
                  'flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-lg transition-all',
                  activeTab === tab.id
                    ? 'bg-white text-cyan-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                ]"
              >
                <span class="material-symbols-outlined text-lg">{{ tab.icon }}</span>
                {{ tab.label }}
              </button>
            </div>
          </div>

          <div class="p-6 md:p-8 max-w-xl">
            <!-- Perfil -->
            <div v-if="activeTab === 'profile'">
              <div class="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
                <div class="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold ring-4 ring-primary/10">
                  {{ userInitial }}
                </div>
                <div>
                  <p class="font-bold text-cyan-900 text-lg">{{ userName }}</p>
                  <p class="text-sm text-slate-500">{{ userEmail }}</p>
                </div>
              </div>

              <div class="space-y-5">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1.5">Nome completo</label>
                  <div class="relative">
                    <span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">person</span>
                    <input
                      v-model="profileForm.name"
                      type="text"
                      class="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1.5">E-mail</label>
                  <div class="relative">
                    <span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">mail</span>
                    <input
                      v-model="profileForm.email"
                      type="email"
                      class="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                </div>
                <div class="flex items-center gap-3 pt-2">
                  <button
                    @click="handleUpdateProfile"
                    :disabled="profileSaving"
                    class="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl hover:brightness-90 transition-all font-semibold text-sm disabled:opacity-50"
                  >
                    <span v-if="profileSaving" class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                    <span v-else class="material-symbols-outlined text-[18px]">save</span>
                    {{ profileSaving ? 'Salvando...' : 'Salvar' }}
                  </button>
                </div>
                <Transition name="fade">
                  <div
                    v-if="profileMessage"
                    :class="profileMessageType === 'success' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-red-700 bg-red-50 border-red-200'"
                    class="text-sm rounded-xl px-4 py-3 border flex items-center gap-2"
                  >
                    <span class="material-symbols-outlined text-lg">{{ profileMessageType === 'success' ? 'check_circle' : 'error' }}</span>
                    {{ profileMessage }}
                  </div>
                </Transition>
              </div>
            </div>

            <!-- Segurança -->
            <div v-if="activeTab === 'security'">
              <div class="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100">
                <div class="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
                  <span class="material-symbols-outlined text-amber-600">shield</span>
                </div>
                <div>
                  <p class="font-bold text-cyan-900">Segurança</p>
                  <p class="text-sm text-slate-500">Altere sua senha de acesso ao sistema</p>
                </div>
              </div>

              <div class="space-y-5">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1.5">Senha atual</label>
                  <div class="relative">
                    <span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">lock</span>
                    <input
                      v-model="passwordForm.currentPassword"
                      type="password"
                      class="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      placeholder="Digite sua senha atual"
                    />
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1.5">Nova senha</label>
                  <div class="relative">
                    <span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">lock_open</span>
                    <input
                      v-model="passwordForm.newPassword"
                      type="password"
                      class="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1.5">Confirmar nova senha</label>
                  <div class="relative">
                    <span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">lock_open</span>
                    <input
                      v-model="passwordForm.confirmPassword"
                      type="password"
                      class="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      placeholder="Repita a nova senha"
                    />
                  </div>
                </div>
                <div v-if="passwordError" class="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3 border border-red-200 flex items-center gap-2">
                  <span class="material-symbols-outlined text-lg">warning</span>
                  {{ passwordError }}
                </div>
                <div class="flex items-center gap-3 pt-2">
                  <button
                    @click="handleChangePassword"
                    :disabled="passwordSaving"
                    class="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl hover:brightness-90 transition-all font-semibold text-sm disabled:opacity-50"
                  >
                    <span v-if="passwordSaving" class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                    <span v-else class="material-symbols-outlined text-[18px]">key</span>
                    {{ passwordSaving ? 'Alterando...' : 'Alterar Senha' }}
                  </button>
                </div>
                <Transition name="fade">
                  <div
                    v-if="passwordMessage"
                    :class="passwordMessageType === 'success' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-red-700 bg-red-50 border-red-200'"
                    class="text-sm rounded-xl px-4 py-3 border flex items-center gap-2"
                  >
                    <span class="material-symbols-outlined text-lg">{{ passwordMessageType === 'success' ? 'check_circle' : 'error' }}</span>
                    {{ passwordMessage }}
                  </div>
                </Transition>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <div v-if="sidebarOpen" class="fixed inset-0 bg-black/50 z-40 md:hidden" @click="sidebarOpen = false"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import SideNavBar from '@/modules/shared/components/SideNavBar.vue'
import TopAppBar from '@/modules/shared/components/TopAppBar.vue'
import { authService } from '@/modules/auth/services/auth.service'
import { http } from '@/api/http'
import { useSidebar } from '@/modules/shared/composables/useSidebar'

const router = useRouter()
const { sidebarOpen, sidebarCollapsed, toggleCollapse } = useSidebar()

const user = authService.getUser()
const userName = ref(user?.name || '')
const userEmail = ref(user?.email || '')
const userInitial = computed(() => (user?.name || 'U').charAt(0).toUpperCase())

const activeTab = ref('profile')

const tabs = [
  { id: 'profile', label: 'Perfil', icon: 'person' },
  { id: 'security', label: 'Segurança', icon: 'shield' },
]

const profileForm = ref({
  name: user?.name || '',
  email: user?.email || '',
})
const profileSaving = ref(false)
const profileMessage = ref('')
const profileMessageType = ref<'success' | 'error'>('success')

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})
const passwordError = ref('')
const passwordSaving = ref(false)
const passwordMessage = ref('')
const passwordMessageType = ref<'success' | 'error'>('success')

async function handleUpdateProfile() {
  profileSaving.value = true
  profileMessage.value = ''
  try {
    const res = await http.patch('/auth/me', {
      name: profileForm.value.name,
      email: profileForm.value.email,
    })
    const data = (res.data as any).data as { name: string; email: string }
    authService.updateUser({ name: data.name, email: data.email })
    userName.value = data.name
    userEmail.value = data.email
    profileMessage.value = 'Perfil atualizado com sucesso!'
    profileMessageType.value = 'success'
  } catch (err: any) {
    profileMessage.value = err?.response?.data?.message || 'Erro ao atualizar perfil.'
    profileMessageType.value = 'error'
  } finally {
    profileSaving.value = false
  }
}

async function handleChangePassword() {
  passwordError.value = ''
  passwordMessage.value = ''

  if (!passwordForm.value.currentPassword) {
    passwordError.value = 'A senha atual é obrigatória.'
    return
  }
  if (!passwordForm.value.newPassword) {
    passwordError.value = 'A nova senha é obrigatória.'
    return
  }
  if (passwordForm.value.newPassword.length < 6) {
    passwordError.value = 'A nova senha deve ter no mínimo 6 caracteres.'
    return
  }
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordError.value = 'As senhas não conferem.'
    return
  }

  passwordSaving.value = true
  try {
    await http.post('/auth/change-password', {
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword,
    })
    passwordMessage.value = 'Senha alterada com sucesso!'
    passwordMessageType.value = 'success'
    passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
  } catch (err: any) {
    passwordMessage.value = err?.response?.data?.message || 'Erro ao alterar senha.'
    passwordMessageType.value = 'error'
  } finally {
    passwordSaving.value = false
  }
}

const handleQuickAction = () => {}

const handleLogout = async () => {
  try { await http.post('/auth/logout') } catch {}
  authService.logout()
  router.push('/')
}
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
