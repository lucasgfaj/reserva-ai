import { createRouter, createWebHistory } from 'vue-router'
import { authRoutes } from '@/modules/auth/auth.routes'
import { landingRoutes } from '@/modules/landing/landing.routes'
import { dashboardRoutes } from '@/modules/dashboard/dashboard.routes'
import { adminRoutes } from '@/modules/admin/routes'
import { residentRoutes } from '@/modules/resident/routes'
import { authService } from '@/modules/auth/services/auth.service'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    ...landingRoutes,
    ...authRoutes,
    ...dashboardRoutes,
    ...adminRoutes,
    ...residentRoutes,
  ],
})

const publicRoutes = ['/', '/login', '/register']

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('auth_token')

  // Redirect /dashboard para a página correta conforme role
  if (to.path === '/dashboard') {
    const user = authService.getUser()
    if (user?.role === 'ADMIN') {
      return next('/condominium/dashboard')
    } else if (user?.role === 'RESIDENT') {
      return next('/resident/dashboard')
    }
  }

  // Se não tem token e tenta acessar rota privada
  if (!token && !publicRoutes.includes(to.path)) {
    localStorage.removeItem('auth_token')
    return next('/login')
  }

  // Se tem token e tenta acessar rota pública
  if (token && publicRoutes.includes(to.path)) {
    return next('/dashboard')
  }

  // Rota não encontrada - redireciona para dashboard
  if (to.matched.length === 0) {
    return next('/dashboard')
  }

  next()
})