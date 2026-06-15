import { http } from '@/api/http'

export interface Unit {
  id: string
  number: string
  blockId: string
  blockName?: string
  createdAt: string
  updatedAt: string
}

export interface UnitListOutput {
  units: Unit[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export const unitsService = {
  async getAll(page = 1, limit = 10, blockId?: string): Promise<UnitListOutput> {
    const params: Record<string, unknown> = { page, limit }
    if (blockId) params.blockId = blockId
    const response = await http.get('/units', { params })
    return response.data.data
  },

  async getById(id: string): Promise<Unit> {
    const response = await http.get(`/units/${id}`)
    return response.data.data
  },

  async create(data: { number: string; blockId: string }): Promise<Unit> {
    const response = await http.post('/units', data)
    return response.data.data
  },

  async update(id: string, data: { number?: string; blockId?: string }): Promise<Unit> {
    const response = await http.patch(`/units/${id}`, data)
    return response.data.data
  },

  async delete(id: string): Promise<{ message: string }> {
    const response = await http.delete(`/units/${id}`)
    return response.data.data
  },
}
