import { createRouter, createWebHistory } from 'vue-router'
import NotFoundPage from '@/modules/shared/pages/NotFoundPage.vue'
import { authRoutes } from '@/modules/auth/auth.routes'
import { landingRoutes } from '@/modules/landing/landing.routes'
import { adminRoutes } from '@/modules/admin/routes'
import { residentRoutes } from '@/modules/resident/routes'
import { authService } from '@/modules/auth/services/auth.service'

const XSS_REGEX = /[<>"']/

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
    { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundPage },
  ],
})

const publicRoutes = ['/', '/login', '/register']

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('auth_token')

  // XSS protection: se a rota contém caracteres de script, redireciona para 404
  if (XSS_REGEX.test(to.path)) {
    return next({ name: 'not-found' })
  }

  // Rota não encontrada (catch-all): permite acesso público à página 404
  if (to.name === 'not-found') {
    return next()
  }

  // Se não tem token e tenta acessar rota privada
  if (!token && !publicRoutes.includes(to.path)) {
    localStorage.removeItem('auth_token')
    return next('/login')
  }

  // Se tem token e tenta acessar rota pública
  if (token && publicRoutes.includes(to.path)) {
    return next(dashboardByRole())
  }

  next()
})