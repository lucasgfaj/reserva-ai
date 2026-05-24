import { describe, it, expect, beforeEach, vi } from 'vitest'
import { http } from '@/api/http'
import { residentsService, type Resident, type ResidentListOutput } from './residents.service'

vi.mock('@/api/http', () => ({
  http: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}))

describe('residentsService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAll', () => {
    it('should return residents list', async () => {
      const mockResponse = {
        data: {
          data: {
            residents: [
              { id: '1', name: 'John', email: 'john@test.com', role: 'RESIDENT', isActive: true, canBook: true },
            ],
            total: 1,
          },
        },
      }
      vi.mocked(http.get).mockResolvedValue(mockResponse)

      const result = await residentsService.getAll()

      expect(http.get).toHaveBeenCalledWith('/residents', { params: { page: 1, limit: 10 } })
      expect(result.residents).toHaveLength(1)
      expect(result.total).toBe(1)
    })

    it('should handle empty residents list', async () => {
      const mockResponse = { data: { data: { residents: [], total: 0 } } }
      vi.mocked(http.get).mockResolvedValue(mockResponse)

      const result = await residentsService.getAll()

      expect(result.residents).toHaveLength(0)
      expect(result.total).toBe(0)
    })
  })

  describe('getById', () => {
    it('should return resident by id', async () => {
      const mockResident = { id: '1', name: 'John', email: 'john@test.com', role: 'RESIDENT', isActive: true, canBook: true }
      const mockResponse = { data: { data: mockResident } }
      vi.mocked(http.get).mockResolvedValue(mockResponse)

      const result = await residentsService.getById('1')

      expect(http.get).toHaveBeenCalledWith('/residents/1')
      expect(result).toEqual(mockResident)
    })
  })

  describe('create', () => {
    it('should create resident with required fields', async () => {
      const mockResponse = {
        data: {
          data: {
            message: 'Morador cadastrado',
            user: { id: '1', name: 'New User', email: 'new@test.com', role: 'RESIDENT' },
          },
        },
      }
      vi.mocked(http.post).mockResolvedValue(mockResponse)

      const result = await residentsService.create({
        name: 'New User',
        email: 'new@test.com',
      })

      expect(http.post).toHaveBeenCalledWith('/residents', {
        name: 'New User',
        email: 'new@test.com',
        canBook: true,
      })
      expect(result.message).toBe('Morador cadastrado')
    })

    it('should create resident with all fields', async () => {
      const mockResponse = {
        data: {
          data: {
            message: 'Morador cadastrado',
            user: { id: '1', name: 'Full User', email: 'full@test.com', role: 'RESIDENT' },
          },
        },
      }
      vi.mocked(http.post).mockResolvedValue(mockResponse)

      await residentsService.create({
        name: 'Full User',
        email: 'full@test.com',
        unit: 'Ap 101',
        phone: '11999999999',
        canBook: true,
        password: 'Pass1234',
      })

      expect(http.post).toHaveBeenCalledWith('/residents', {
        name: 'Full User',
        email: 'full@test.com',
        unitId: 'Ap 101',
        phone: '11999999999',
        canBook: true,
        password: 'Pass1234',
      })
    })

    it('should handle canBook false', async () => {
      const mockResponse = {
        data: { data: { message: 'Morador cadastrado' } },
      }
      vi.mocked(http.post).mockResolvedValue(mockResponse)

      await residentsService.create({
        name: 'Restricted User',
        email: 'restricted@test.com',
        canBook: false,
      })

      expect(http.post).toHaveBeenCalledWith('/residents', {
        name: 'Restricted User',
        email: 'restricted@test.com',
        canBook: false,
      })
    })
  })

  describe('updatePermissions', () => {
    it('should update canBook permission', async () => {
      const mockResponse = {
        data: {
          message: 'Permissão atualizada',
          canBook: false,
        },
      }
      vi.mocked(http.patch).mockResolvedValue(mockResponse)

      const result = await residentsService.updatePermissions('1', false)

      expect(http.patch).toHaveBeenCalledWith('/residents/1/permissions', { canBook: false })
      expect(result.canBook).toBe(false)
    })
  })
})