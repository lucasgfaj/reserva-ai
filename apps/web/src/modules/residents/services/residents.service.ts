import { http } from '@/api/http'

export interface Resident {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  canBook: boolean
  document?: string
  phone?: string
  unitId?: string
  unit?: string
  createdAt: string
  updatedAt?: string
}

export interface ResidentListOutput {
  residents: Resident[]
  total: number
}

export const residentsService = {
  async getAll(): Promise<ResidentListOutput> {
    const response = await http.get('/residents')
    return response.data
  },

  async getById(id: string): Promise<Resident> {
    const response = await http.get(`/residents/${id}`)
    return response.data
  },

  async create(resident: {
    name: string
    email: string
    unit?: string
    phone?: string
    canBook?: boolean
    password?: string
  }) {
    const payload: Record<string, unknown> = {
      name: resident.name.trim(),
      email: resident.email.trim().toLowerCase(),
      canBook: resident.canBook === false ? false : true,
    }
    
    if (resident.unit?.trim()) payload.unitId = resident.unit.trim()
    if (resident.phone?.trim()) payload.phone = resident.phone.trim()
    if (resident.password?.trim()) payload.password = resident.password.trim()
    
    const response = await http.post('/residents', payload)
    return response.data
  },

  async updatePermissions(id: string, canBook: boolean) {
    const response = await http.patch(`/residents/${id}/permissions`, { canBook })
    return response.data
  },
}