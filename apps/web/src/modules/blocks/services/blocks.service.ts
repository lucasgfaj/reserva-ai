import { http } from '@/api/http'

export interface Block {
  id: string
  name: string
  condominiumId: string
  createdAt: string
  updatedAt: string
}

export interface BlockListOutput {
  blocks: Block[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export const blocksService = {
  async getAll(page = 1, limit = 10): Promise<BlockListOutput> {
    const response = await http.get('/blocks', { params: { page, limit } })
    return response.data.data
  },

  async getById(id: string): Promise<Block> {
    const response = await http.get(`/blocks/${id}`)
    return response.data.data
  },

  async create(data: { name: string }): Promise<Block> {
    const response = await http.post('/blocks', data)
    return response.data.data
  },

  async update(id: string, data: { name?: string }): Promise<Block> {
    const response = await http.patch(`/blocks/${id}`, data)
    return response.data.data
  },

  async delete(id: string): Promise<{ message: string }> {
    const response = await http.delete(`/blocks/${id}`)
    return response.data.data
  },
}
