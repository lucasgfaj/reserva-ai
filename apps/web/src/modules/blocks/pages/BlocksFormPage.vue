<template>
  <div class="flex min-h-screen bg-surface text-on-surface">
    <SideNavBar role="ADMIN" :userName="userName" :collapsed="sidebarCollapsed" @toggle-collapse="toggleCollapse" @logout="handleLogout" @cta-click="handleQuickAction" :class="['transition-transform duration-300', sidebarOpen ? 'translate-x-0' : '-translate-x-full', 'fixed z-50', 'md:translate-x-0']" />

    <main :class="['flex-1 flex flex-col min-h-screen w-full transition-all duration-300', sidebarCollapsed ? 'md:ml-16' : 'md:ml-72']">
      <TopAppBar :userName="userName" userRole="ADMIN" @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <div class="flex-1 p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 lg:space-y-8 w-full max-w-2xl">
        <div>
          <h2 class="text-2xl md:text-3xl font-extrabold text-primary tracking-tight font-headline">{{ isEdit ? 'Editar Bloco' : 'Novo Bloco' }}</h2>
          <p class="text-on-surface-variant mt-1 md:mt-2 text-sm md:text-base">{{ isEdit ? 'Atualize as informações do bloco' : 'Cadastre um novo bloco no condomínio' }}</p>
        </div>

        <!-- Loading skeleton for edit mode -->
        <div v-if="isEdit && loading" class="bg-surface-container-lowest rounded-2xl md:rounded-3xl p-4 md:p-6 space-y-6 shadow-sm animate-pulse">
          <div>
            <div class="h-4 bg-slate-200 rounded w-1/4 mb-1.5" />
            <div class="h-11 bg-slate-200 rounded-xl" />
          </div>
          <div class="flex items-center gap-3 pt-2">
            <div class="h-11 bg-slate-200 rounded-xl w-28" />
            <div class="h-11 bg-slate-200 rounded-xl w-24" />
          </div>
        </div>

        <form v-else @submit.prevent="handleSubmit" class="bg-surface-container-lowest rounded-2xl md:rounded-3xl p-4 md:p-6 space-y-6 shadow-sm">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Nome do Bloco</label>
            <input v-model="form.name" type="text" class="w-full px-4 py-3 bg-surface-container-low border-none rounded-xl text-sm" placeholder="Ex: Bloco A" required />
            <p v-if="errors.name" class="text-error text-xs mt-1">{{ errors.name }}</p>
          </div>

          <div class="flex items-center gap-3 pt-2">
            <button type="submit" class="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity text-sm" :disabled="saving">
              {{ saving ? 'Salvando...' : (isEdit ? 'Atualizar' : 'Criar Bloco') }}
            </button>
            <router-link to="/condominium/blocks" class="px-6 py-3 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors text-sm">Cancelar</router-link>
          </div>
        </form>
      </div>
    </main>

    <div v-if="sidebarOpen" class="fixed inset-0 bg-black/50 z-40 md:hidden" @click="sidebarOpen = false"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import SideNavBar from '@/modules/shared/components/SideNavBar.vue'
import TopAppBar from '@/modules/shared/components/TopAppBar.vue'
import { authService } from '@/modules/auth/services/auth.service'
import { blocksService } from '../services/blocks.service'
import { http } from '@/api/http'
import { useToast } from '@/modules/shared/composables/useToast'
import { useApiError } from '@/modules/shared/composables/useApiError'
import { useSidebar } from '@/modules/shared/composables/useSidebar'

const router = useRouter()
const route = useRoute()
const { success: showSuccess } = useToast()
const { handleError } = useApiError()

const user = authService.getUser()
const userName = ref(user?.name || '')
const { sidebarOpen, sidebarCollapsed, toggleCollapse } = useSidebar()

const isEdit = computed(() => !!route.params.id)
const saving = ref(false)
const loading = ref(false)
const form = ref({ name: '' })
const errors = ref<Record<string, string>>({})

onMounted(async () => {
  if (isEdit.value) {
    loading.value = true
    try {
      const block = await blocksService.getById(route.params.id as string)
      form.value.name = block.name
    } catch (err) {
      handleError(err, 'Erro ao carregar bloco')
    } finally {
      loading.value = false
    }
  }
})

const handleSubmit = async () => {
  errors.value = {}
  if (!form.value.name.trim()) {
    errors.value.name = 'O nome é obrigatório'
    return
  }

  saving.value = true
  try {
    if (isEdit.value) {
      await blocksService.update(route.params.id as string, { name: form.value.name.trim() })
      showSuccess('Bloco atualizado com sucesso')
    } else {
      await blocksService.create({ name: form.value.name.trim() })
      showSuccess('Bloco criado com sucesso')
    }
    router.push('/condominium/blocks')
  } catch (err) {
    handleError(err, `Erro ao ${isEdit.value ? 'atualizar' : 'criar'} bloco`)
  } finally {
    saving.value = false
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
</script>

<style scoped>
.font-headline { font-family: 'Manrope', sans-serif; }
.material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
</style>
