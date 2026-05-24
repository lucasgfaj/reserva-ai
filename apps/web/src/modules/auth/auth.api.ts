import { http } from '@/api/http'

export interface LoginDTO {
  email: string
  password: string
}

export interface LoginResponse {
  message: string
  accessToken: string
  user: {
    id: string
    name: string
    email: string
    role: string
  }
  condominium: {
    id: string
    name: string
  }
}

export const loginRequest = async (data: LoginDTO) => {
  const response = await http.post<LoginResponse>('/auth/login', data)
  return response.data
}