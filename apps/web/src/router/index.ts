import { createRouter, createWebHistory } from 'vue-router'
import { authRoutes } from '@/modules/auth/auth.routes'
import { landingRoutes } from '@/modules/landing/landing.routes'
import { dashboardRoutes } from '@/modules/dashboard/dashboard.routes'
import { residentsRoutes } from '@/modules/residents/residents.routes'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    ...landingRoutes,
    ...authRoutes,
    ...dashboardRoutes,
    ...residentsRoutes,
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
    return next('/dashboard')
  }

  next()
})