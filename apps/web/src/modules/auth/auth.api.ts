import { http } from '@/api/http'

export interface LoginDTO {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  user: {
    id: number
    name: string
    email: string
  }
}

export const loginRequest = async (data: LoginDTO) => {
  const response = await http.post<LoginResponse>('/auth/login', data)
  return response.data
}