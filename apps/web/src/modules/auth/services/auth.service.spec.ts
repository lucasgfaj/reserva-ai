import { describe, it, expect, beforeEach, vi } from 'vitest'
import { authService } from '../services/auth.service'

describe('AuthService', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  describe('getToken', () => {
    it('should return null when no token stored', () => {
      expect(authService.getToken()).toBeNull()
    })

    it('should return token when stored', () => {
      localStorage.setItem('auth_token', '"fake-token"')
      expect(authService.getToken()).toBe('fake-token')
    })
  })

  describe('getUser', () => {
    it('should return null when no user stored', () => {
      expect(authService.getUser()).toBeNull()
    })

    it('should return user when stored', () => {
      const user = { id: '1', name: 'John', email: 'john@test.com', role: 'ADMIN' }
      localStorage.setItem('auth_user', JSON.stringify(user))
      expect(authService.getUser()).toEqual(user)
    })
  })

  describe('isAuthenticated', () => {
    it('should return false when no token', () => {
      expect(authService.isAuthenticated()).toBe(false)
    })

    it('should return true when token exists', () => {
      localStorage.setItem('auth_token', '"token"')
      expect(authService.isAuthenticated()).toBe(true)
    })
  })

  describe('logout', () => {
    it('should clear all auth storage', () => {
      localStorage.setItem('auth_token', '"token"')
      localStorage.setItem('auth_user', '{"id":"1"}')
      localStorage.setItem('auth_condo', '{"id":"1"}')

      authService.logout()

      expect(authService.getToken()).toBeNull()
      expect(authService.getUser()).toBeNull()
    })
  })
})