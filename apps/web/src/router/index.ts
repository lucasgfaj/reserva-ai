import { createRouter, createWebHistory } from 'vue-router'
import { authRoutes } from '@/modules/auth/auth.routes'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    ...authRoutes,
  ],
})