import { computed } from 'vue'
import { authService } from '@/modules/auth/services/auth.service'

export type UserRole = 'ADMIN' | 'RESIDENT' | 'SUPER_ADMIN'

export function useUserRole() {
  const user = authService.getUser()

  const role = computed(() => user?.role as UserRole | null)
  const isAdmin = computed(() => role.value === 'ADMIN')
  const isResident = computed(() => role.value === 'RESIDENT')
  const isSuperAdmin = computed(() => role.value === 'SUPER_ADMIN')

  const userName = computed(() => user?.name || '')
  const userEmail = computed(() => user?.email || '')

  return {
    role,
    isAdmin,
    isResident,
    isSuperAdmin,
    userName,
    userEmail,
  }
}