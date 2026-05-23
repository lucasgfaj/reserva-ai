import { createRouter, createWebHistory } from 'vue-router'
import { authRoutes } from '@/modules/auth/auth.routes'
import { landingRoutes } from '@/modules/landing/landing.routes'
import { adminRoutes } from '@/modules/admin/routes'
import { residentRoutes } from '@/modules/resident/routes'
import { authService } from '@/modules/auth/services/auth.service'

const dashboardByRole = () => {
  const user = authService.getUser()
  if (user?.role === 'ADMIN') return '/condominium/dashboard'
  if (user?.role === 'RESIDENT') return '/resident/dashboard'
  return '/login'
}

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    ...landingRoutes,
    ...authRoutes,
    ...adminRoutes,
    ...residentRoutes,
  ],
})

const publicRoutes = ['/', '/login', '/register']

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('auth_token')

  // Se não tem token e tenta acessar rota privada
  if (!token && !publicRoutes.includes(to.path)) {
    localStorage.removeItem('auth_token')
    return next('/login')
  }

  // Se tem token e tenta acessar rota pública
  if (token && publicRoutes.includes(to.path)) {
    return next(dashboardByRole())
  }

  // Rota não encontrada - redireciona para dashboard conforme role
  if (to.matched.length === 0) {
    return next(dashboardByRole())
  }

  next()
})