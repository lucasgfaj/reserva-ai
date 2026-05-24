import { ref } from 'vue'
import { useRouter } from 'vue-router'

const sidebarOpen = ref(false)
const sidebarCollapsed = ref(false)

export function useSidebar() {
  const router = useRouter()

  const close = () => { sidebarOpen.value = false }

  router.afterEach(close)

  return {
    sidebarOpen,
    sidebarCollapsed,
    toggle: () => { sidebarOpen.value = !sidebarOpen.value },
    toggleCollapse: () => { sidebarCollapsed.value = !sidebarCollapsed.value },
    open: () => { sidebarOpen.value = true },
    close,
  }
}
