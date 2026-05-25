<template>
  <header class="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-xl shadow-sm shadow-cyan-900/5 px-4 md:px-8 lg:px-12 py-4 md:py-6 flex justify-between items-center">
    <!-- Mobile: Hamburger button -->
    <button
      @click="$emit('toggle-sidebar')"
      class="md:hidden p-2 -ml-2 text-slate-600 hover:text-cyan-900 transition-colors"
    >
      <span class="material-symbols-outlined text-2xl">menu</span>
    </button>

    <!-- Spacer -->
    <div class="hidden md:block flex-1"></div>

    <!-- Right side -->
    <div class="flex items-center gap-4 md:gap-6">

      <!-- Notifications -->
      <div class="relative" ref="notificationRef">
        <button
          @click="toggleNotifications"
          class="p-2 text-slate-400 hover:text-cyan-900 transition-colors relative"
        >
          <span class="material-symbols-outlined">notifications</span>
          <span
            v-if="totalUnread > 0"
            class="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-error rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white px-1"
          >
            {{ totalUnread > 9 ? '9+' : totalUnread }}
          </span>
        </button>

        <!-- Notification dropdown -->
        <Transition name="dropdown">
          <div
            v-if="showNotifications"
            class="absolute right-0 top-full mt-3 w-80 md:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
          >
            <div class="p-4 border-b border-slate-100">
              <div class="flex items-center justify-between">
                <h3 class="text-sm font-bold text-cyan-900">Notificações</h3>
                <span v-if="totalUnread" class="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                  {{ totalUnread }} nova{{ totalUnread > 1 ? 's' : '' }}
                </span>
              </div>
            </div>
            <div class="max-h-80 overflow-y-auto">
              <div v-if="loadingNotifications" class="flex items-center justify-center py-8">
                <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
              </div>
              <div v-else-if="combinedList.length === 0" class="py-8 text-center text-slate-400">
                <span class="material-symbols-outlined text-3xl">notifications_off</span>
                <p class="text-sm mt-1">Nenhuma notificação</p>
              </div>
              <div v-else>
                <div
                  v-for="item in combinedList"
                  :key="item.id"
                  @click="item.onClick?.()"
                  class="flex items-start gap-3 px-4 py-3.5 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-50 last:border-0"
                >
                  <div :class="['w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5', item.bgClass]">
                    <span :class="['material-symbols-outlined text-base', item.iconClass]">{{ item.icon }}</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-cyan-900 truncate">{{ item.title }}</p>
                    <p class="text-xs text-slate-500 mt-0.5 line-clamp-2">{{ item.subtitle }}</p>
                    <p class="text-[10px] text-slate-400 mt-1">{{ item.time }}</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="p-3 border-t border-slate-100">
              <router-link
                :to="announcementsLink"
                class="block text-center text-xs font-semibold text-primary hover:underline py-1"
                @click="showNotifications = false"
              >
                Ver todos os comunicados
              </router-link>
            </div>
          </div>
        </Transition>
      </div>

      <!-- User profile -->
      <div class="relative" ref="profileRef">
        <button
          @click="toggleProfile"
          class="flex items-center gap-2 md:gap-3 pl-2 md:pl-6 border-l border-slate-100 hover:opacity-80 transition-opacity"
        >
          <div class="text-right hidden sm:block">
            <p class="text-sm font-bold text-cyan-900 leading-none">{{ userName || 'Usuário' }}</p>
            <p class="text-[11px] text-slate-400 mt-1">{{ roleLabel }}</p>
          </div>
          <div class="w-9 h-9 md:w-10 md:h-10 rounded-full bg-primary flex items-center justify-center text-white ring-2 ring-surface-container font-bold text-sm md:text-base">
            {{ userName ? userName.charAt(0).toUpperCase() : 'U' }}
          </div>
        </button>

        <!-- Profile dropdown -->
        <Transition name="dropdown">
          <div
            v-if="showProfile"
            class="absolute right-0 top-full mt-3 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
          >
            <div class="p-4 border-b border-slate-100">
              <p class="text-sm font-bold text-cyan-900 truncate">{{ userName }}</p>
              <p class="text-xs text-slate-400 mt-0.5">{{ roleLabel }}</p>
            </div>
            <div class="py-1">
              <router-link
                :to="settingsLink"
                class="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                @click="showProfile = false"
              >
                <span class="material-symbols-outlined text-slate-400 text-lg">settings</span>
                Configurações
              </router-link>
              <router-link
                :to="helpLink"
                class="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                @click="showProfile = false"
              >
                <span class="material-symbols-outlined text-slate-400 text-lg">help</span>
                Ajuda
              </router-link>
              <button
                @click="handleLogout"
                class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <span class="material-symbols-outlined text-lg">logout</span>
                Sair
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { http } from '@/api/http'
import { authService } from '@/modules/auth/services/auth.service'
import { useToast } from '@/modules/shared/composables/useToast'

const props = withDefaults(defineProps<{
  userName?: string
  userRole?: string
}>(), {
  userName: '',
  userRole: 'ADMIN'
})

const emit = defineEmits<{
  'toggle-sidebar': []
}>()

const router = useRouter()

const announcementsLink = computed(() => {
  return props.userRole === 'ADMIN' ? '/condominium/announcements' : '/resident/announcements'
})

const settingsLink = computed(() => {
  return props.userRole === 'ADMIN' ? '/condominium/settings/account' : '/resident/settings'
})

const helpLink = computed(() => {
  return props.userRole === 'ADMIN' ? '/condominium/help' : '/resident/help'
})

const roleLabel = computed(() => {
  const labels: Record<string, string> = {
    ADMIN: 'Administrador',
    RESIDENT: 'Morador',
    SUPER_ADMIN: 'Super Admin'
  }
  return labels[props.userRole] || 'Usuário'
})

// Notifications
const showNotifications = ref(false)
const loadingNotifications = ref(true)
const announcements = ref<any[]>([])
const notificationRef = ref<HTMLElement | null>(null)

// Profile
const showProfile = ref(false)
const profileRef = ref<HTMLElement | null>(null)

function toggleNotifications() {
  showProfile.value = false
  showNotifications.value = !showNotifications.value
  if (showNotifications.value) {
    fetchAnnouncements()
  }
}

function toggleProfile() {
  showNotifications.value = false
  showProfile.value = !showProfile.value
}

function goToAnnouncements() {
  showNotifications.value = false
  router.push(announcementsLink.value)
}

async function fetchAnnouncements() {
  loadingNotifications.value = true
  try {
    const res = await http.get('/announcements', { params: { limit: 5 } })
    const data = (res.data as any).data
    announcements.value = data.announcements || []
  } catch {
    announcements.value = []
  } finally {
    loadingNotifications.value = false
  }
}

function timeAgo(dateStr: string) {
  const now = Date.now()
  const date = new Date(dateStr).getTime()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'agora'
  if (minutes < 60) return `${minutes}min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d`
  return new Date(dateStr).toLocaleDateString('pt-BR')
}

// Toast integration
const { toasts } = useToast()

const toastNotifications = computed(() =>
  toasts.value.slice(-3).reverse().map(t => ({
    id: `toast-${t.id}`,
    icon: t.type === 'error' ? 'error' : t.type === 'success' ? 'check_circle' : t.type === 'warning' ? 'warning' : 'info',
    iconClass: t.type === 'error' ? 'text-red-500' : t.type === 'success' ? 'text-emerald-500' : t.type === 'warning' ? 'text-amber-500' : 'text-primary',
    bgClass: t.type === 'error' ? 'bg-red-50' : t.type === 'success' ? 'bg-emerald-50' : t.type === 'warning' ? 'bg-amber-50' : 'bg-primary/10',
    title: t.type === 'error' ? 'Erro' : t.type === 'success' ? 'Sucesso' : t.type === 'warning' ? 'Aviso' : 'Info',
    subtitle: t.message,
    time: 'agora',
    onClick: () => {},
  }))
)

const announcementNotifications = computed(() =>
  announcements.value.map(a => ({
    id: `ann-${a.id}`,
    icon: 'campaign',
    iconClass: 'text-primary',
    bgClass: 'bg-primary/10',
    title: a.title,
    subtitle: a.content,
    time: timeAgo(a.createdAt),
    onClick: goToAnnouncements,
  }))
)

const combinedList = computed(() => [
  ...toastNotifications.value,
  ...announcementNotifications.value,
].slice(0, 8))

const totalUnread = computed(() =>
  announcements.value.length + toasts.value.length
)

async function handleLogout() {
  showProfile.value = false
  try { await http.post('/auth/logout') } catch {}
  authService.logout()
  router.push('/')
}

function handleClickOutside(e: MouseEvent) {
  const target = e.target as Node
  if (notificationRef.value && !notificationRef.value.contains(target)) {
    showNotifications.value = false
  }
  if (profileRef.value && !profileRef.value.contains(target)) {
    showProfile.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  fetchAnnouncements()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

.dropdown-enter-active {
  transition: all 0.15s ease-out;
}
.dropdown-leave-active {
  transition: all 0.1s ease-in;
}
.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-4px);
}
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
