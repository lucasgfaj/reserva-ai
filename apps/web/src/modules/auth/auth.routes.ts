import LoginPage from './pages/LoginPage.vue'
import RegisterPage from './pages/RegisterPage.vue'

export const authRoutes = [
  {
    path: '/login',
    component: LoginPage,
  },
  {
    path: '/register',
    component: RegisterPage,
  },
]