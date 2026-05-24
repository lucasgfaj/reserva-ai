import { http } from '@/api/http'

export interface RegisterTenantDTO {
  condominiumName: string
  condominiumAddress: string
  adminName: string
  adminEmail: string
  adminPassword: string
}

export const registerTenantRequest = async (data: RegisterTenantDTO) => {
  const response = await http.post('/auth/register', data)
  return response.data
}
