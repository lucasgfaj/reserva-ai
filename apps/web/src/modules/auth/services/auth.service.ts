import { http } from '@/api/http'
import type { RegisterTenantDTO } from './dtos/register-tenant.dto'
import type { LoginDTO } from './dtos/login.dto'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: string
}

export interface AuthTokens {
  accessToken: string
}

export interface RegisterResponse extends AuthTokens {
  message: string
  user: AuthUser
  condominium: {
    id: string
    name: string
  }
}

export interface LoginResponse extends AuthTokens {
  message: string
  user: AuthUser
  condominium: {
    id: string
    name: string
  }
}

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'
const CONDO_KEY = 'auth_condo'

class AuthService {
  private getStorage<T>(key: string): T | null {
    if (typeof window === 'undefined') return null
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : null
  }

  private setStorage<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(key, JSON.stringify(value))
  }

  private removeStorage(key: string): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(key)
  }

  getToken(): string | null {
    return this.getStorage<string>(TOKEN_KEY)
  }

  getUser(): AuthUser | null {
    return this.getStorage<AuthUser>(USER_KEY)
  }

  getCondo(): { id: string; name: string } | null {
    return this.getStorage<{ id: string; name: string }>(CONDO_KEY)
  }

  isAuthenticated(): boolean {
    return !!this.getToken()
  }

  async registerTenant(data: RegisterTenantDTO): Promise<RegisterResponse> {
    const response = await http.post<RegisterResponse>('/auth/register', data)
    const { accessToken, user, condominium } = response.data
    
    this.setStorage(TOKEN_KEY, accessToken)
    this.setStorage(USER_KEY, user)
    this.setStorage(CONDO_KEY, condominium)
    
    return response.data
  }

  async login(data: LoginDTO): Promise<LoginResponse> {
    const response = await http.post<LoginResponse>('/auth/login', data)
    const { accessToken, user, condominium } = response.data
    
    this.setStorage(TOKEN_KEY, accessToken)
    this.setStorage(USER_KEY, user)
    this.setStorage(CONDO_KEY, condominium)
    
    return response.data
  }

  logout(): void {
    this.removeStorage(TOKEN_KEY)
    this.removeStorage(USER_KEY)
    this.removeStorage(CONDO_KEY)
  }

  updateUser(data: { name?: string; email?: string }): void {
    const user = this.getUser()
    if (user) {
      this.setStorage(USER_KEY, { ...user, ...data })
    }
  }
}

export const authService = new AuthService()