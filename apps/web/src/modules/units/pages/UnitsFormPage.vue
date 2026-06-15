<template>
  <div class="flex min-h-screen bg-surface text-on-surface">
    <SideNavBar role="ADMIN" :userName="userName" :collapsed="sidebarCollapsed" @toggle-collapse="toggleCollapse" @logout="handleLogout" @cta-click="handleQuickAction" :class="['transition-transform duration-300', sidebarOpen ? 'translate-x-0' : '-translate-x-full', 'fixed z-50', 'md:translate-x-0']" />

    <main :class="['flex-1 flex flex-col min-h-screen w-full transition-all duration-300', sidebarCollapsed ? 'md:ml-16' : 'md:ml-72']">
      <TopAppBar :userName="userName" userRole="ADMIN" @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <div class="flex-1 p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 lg:space-y-8 w-full max-w-2xl">
        <div>
          <h2 class="text-2xl md:text-3xl font-extrabold text-primary tracking-tight font-headline">{{ isEdit ? 'Editar Unidade' : 'Nova Unidade' }}</h2>
          <p class="text-on-surface-variant mt-1 md:mt-2 text-sm md:text-base">{{ isEdit ? 'Atualize as informações da unidade' : 'Cadastre uma nova unidade no condomínio' }}</p>
        </div>

        <!-- Loading skeleton for edit mode -->
        <div v-if="isEdit && loading" class="bg-surface-container-lowest rounded-2xl md:rounded-3xl p-4 md:p-6 space-y-6 shadow-sm animate-pulse">
          <div>
            <div class="h-4 bg-slate-200 rounded w-1/4 mb-1.5" />
            <div class="h-11 bg-slate-200 rounded-xl" />
          </div>
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
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Número da Unidade</label>
            <input v-model="form.number" type="text" class="w-full px-4 py-3 bg-surface-container-low border-none rounded-xl text-sm" placeholder="Ex: 101" required />
            <p v-if="errors.number" class="text-error text-xs mt-1">{{ errors.number }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Bloco</label>
            <select v-model="form.blockId" class="w-full px-4 py-3 pr-8 bg-surface-container-low border-none rounded-xl text-sm appearance-none" :required="!isEdit">
              <option value="" disabled>Selecione um bloco</option>
              <option v-for="block in blocks" :key="block.id" :value="block.id">{{ block.name }}</option>
            </select>
            <p v-if="errors.blockId" class="text-error text-xs mt-1">{{ errors.blockId }}</p>
          </div>

          <div class="flex items-center gap-3 pt-2">
            <button type="submit" class="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity text-sm" :disabled="saving">
              {{ saving ? 'Salvando...' : (isEdit ? 'Atualizar' : 'Criar Unidade') }}
            </button>
            <router-link to="/condominium/units" class="px-6 py-3 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors text-sm">Cancelar</router-link>
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
import { blocksService } from '@/modules/blocks/services/blocks.service'
import { unitsService } from '../services/units.service'
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
const blocks = ref<{ id: string; name: string }[]>([])
const form = ref({ number: '', blockId: '' })
const errors = ref<Record<string, string>>({})

onMounted(async () => {
  try {
    const data = await blocksService.getAll(1, 100)
    blocks.value = data.blocks || []
  } catch {}

  if (isEdit.value) {
    loading.value = true
    try {
      const unit = await unitsService.getById(route.params.id as string)
      form.value.number = unit.number
      form.value.blockId = unit.blockId
    } catch (err) {
      handleError(err, 'Erro ao carregar unidade')
    } finally {
      loading.value = false
    }
  }
})

const handleSubmit = async () => {
  errors.value = {}
  if (!form.value.number.trim()) {
    errors.value.number = 'O número é obrigatório'
    return
  }
  if (!isEdit.value && !form.value.blockId) {
    errors.value.blockId = 'O bloco é obrigatório'
    return
  }

  saving.value = true
  try {
    if (isEdit.value) {
      await unitsService.update(route.params.id as string, {
        number: form.value.number.trim(),
        ...(form.value.blockId ? { blockId: form.value.blockId } : {}),
      })
      showSuccess('Unidade atualizada com sucesso')
    } else {
      await unitsService.create({ number: form.value.number.trim(), blockId: form.value.blockId })
      showSuccess('Unidade criada com sucesso')
    }
    router.push('/condominium/units')
  } catch (err) {
    handleError(err, `Erro ao ${isEdit.value ? 'atualizar' : 'criar'} unidade`)
  } finally {
    saving.value = false
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
</script>

<style scoped>
.font-headline { font-family: 'Manrope', sans-serif; }
.material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
</style>
