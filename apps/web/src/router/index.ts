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

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('auth_token')
  const publicRoutes = ['/', '/login', '/register']
  
  if (token && publicRoutes.includes(to.path)) {
    return next('/dashboard')
  }
  next()
})