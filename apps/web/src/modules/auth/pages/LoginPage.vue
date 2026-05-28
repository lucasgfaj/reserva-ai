<template>
  <AuthLayout>
    <template #sidebar>
      <AuthSidebar 
        title="Gestão inteligente para uma vida tranquila."
        bgImage="https://lh3.googleusercontent.com/aida-public/AB6AXuD2oBoJEAucouoQfLF_ao7I9Jgkb5v_tmeFA51CEUMouhr_1OjdDWhoU59n2vg-tpHbKTaNHfZkqPVlYX2xHGmfxzop8BNpSksBOZsP6rPD_qGtbw7aODiiTlz6hbbNWFDqgd4f0Z5yGkT3I0TNa-y5_szNqvHSpzSfnnxEQT5MyZcx43D-p049f_QzU19fPQ0Dob4bXbIwv2D5Ln_LoydRIaAObHP9OxSBzEB2P1l0gTo6hVU7_RTAk50Jj3ESaRqekihux9MrUewe"
        :features="authFeatures"
      />
    </template>

    <AuthPageHeader 
      title="Bem-vindo de volta"
      description="Acesse o seu portal do condomínio"
    />

    <div class="space-y-8">
      <LoginForm 
        :is-loading="isLoading" 
        @submit="handleLogin" 
      />

      <!-- <AuthDivider>Ou entre com seu e-mail</AuthDivider> -->

      <!-- <AuthSocialButtons /> -->
    </div>

    <AuthSupportCards />
  </AuthLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthLayout from '../components/AuthLayout.vue'
import AuthSidebar from '../components/AuthSidebar.vue'
import AuthPageHeader from '../components/AuthPageHeader.vue'
import AuthSocialButtons from '../components/AuthSocialButtons.vue'
import AuthDivider from '../components/AuthDivider.vue'
import AuthSupportCards from '../components/AuthSupportCards.vue'
import LoginForm from '../components/LoginForm.vue'
import { loginRequest } from '../auth.api'
import { authService } from '../services/auth.service'
import { useToast } from '@/modules/shared/composables/useToast'

const router = useRouter()
const isLoading = ref(false)
const error = ref('')
const { success: toastSuccess, error: toastError } = useToast()

const authFeatures = [
  {
    title: 'Segurança de Dados',
    description: 'Criptografia de ponta a ponta e total conformidade com a LGPD para sua tranquilidade.',
    icon: 'verified_user'
  },
  {
    title: 'Interface Personalizada',
    description: 'Configure áreas comuns, regras e horários de acordo com a identidade do seu prédio.',
    icon: 'dashboard_customize'
  }
]

const handleLogin = async (credentials: { email: string; password: string }) => {
  isLoading.value = true
  error.value = ''
  
  try {
    const response = await loginRequest(credentials)
    localStorage.setItem('auth_token', response.accessToken)
    localStorage.setItem('auth_user', JSON.stringify(response.user))
    localStorage.setItem('auth_condo', JSON.stringify(response.condominium))
    toastSuccess(response.message)
    const redirectPath = response.user.role === 'ADMIN'
      ? '/condominium/dashboard'
      : '/resident/dashboard'
    router.push(redirectPath)
  } catch (err: any) {
    const errorMsg = err.retryMessage || (err.code === 'ECONNABORTED'
      ? 'O servidor demorou muito para responder. Verifique sua conexão e tente novamente.'
      : !err.response
        ? 'Não foi possível conectar ao servidor. Verifique sua conexão de rede.'
        : err.response?.data?.message || 'Erro ao fazer login')
    error.value = errorMsg
    toastError(errorMsg)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.loading-spinner {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
