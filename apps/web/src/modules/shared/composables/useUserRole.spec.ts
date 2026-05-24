import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/modules/auth/services/auth.service', () => ({
  authService: {
    getUser: vi.fn(),
  },
}))

import { authService } from '@/modules/auth/services/auth.service'
import { useUserRole } from './useUserRole'

describe('useUserRole', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return admin role', () => {
    vi.mocked(authService.getUser).mockReturnValue({
      name: 'Admin',
      email: 'admin@test.com',
      role: 'ADMIN',
    } as any)

    const { role, isAdmin, isResident, isSuperAdmin, userName, userEmail } = useUserRole()

    expect(role.value).toBe('ADMIN')
    expect(isAdmin.value).toBe(true)
    expect(isResident.value).toBe(false)
    expect(isSuperAdmin.value).toBe(false)
    expect(userName.value).toBe('Admin')
    expect(userEmail.value).toBe('admin@test.com')
  })

  it('should return resident role', () => {
    vi.mocked(authService.getUser).mockReturnValue({
      name: 'Resident',
      email: 'resident@test.com',
      role: 'RESIDENT',
    } as any)

    const { role, isAdmin, isResident, isSuperAdmin } = useUserRole()

    expect(role.value).toBe('RESIDENT')
    expect(isAdmin.value).toBe(false)
    expect(isResident.value).toBe(true)
    expect(isSuperAdmin.value).toBe(false)
  })

  it('should return null role when no user', () => {
    vi.mocked(authService.getUser).mockReturnValue(null as any)

    const { role, isAdmin, isResident, isSuperAdmin, userName, userEmail } = useUserRole()

    expect(role.value).toBeUndefined()
    expect(isAdmin.value).toBe(false)
    expect(isResident.value).toBe(false)
    expect(isSuperAdmin.value).toBe(false)
    expect(userName.value).toBe('')
    expect(userEmail.value).toBe('')
  })
})