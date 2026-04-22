import { createRouter, createWebHistory } from 'vue-router'
import { authRoutes } from '@/modules/auth/auth.routes'
import { landingRoutes } from '@/modules/landing/landing.routes'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    ...landingRoutes,
    ...authRoutes,
  ],
})