<template>
  <AuthLayout>
    <template #sidebar>
      <AuthSidebar 
        title="Gestão inteligente para condomínios que valorizam o tempo."
        bgImage="https://lh3.googleusercontent.com/aida-public/AB6AXuD2oBoJEAucouoQfLF_ao7I9Jgkb5v_tmeFA51CEUMouhr_1OjdDWhoU59n2vg-tpHbKTaNHfZkqPVlYX2xHGmfxzop8BNpSksBOZsP6rPD_qGtbw7aODiiTlz6hbbNWFDqgd4f0Z5yGkT3I0TNa-y5_szNqvHSpzSfnnxEQT5MyZcx43D-p049f_QzU19fPQ0Dob4bXbIwv2D5Ln_LoydRIaAObHP9OxSBzEB2P1l0gTo6hVU7_RTAk50Jj3ESaRqekihux9MrUewe"
        :features="authFeatures"
      />
    </template>

    <RegisterProgress 
      :current="currentStep" 
      :total="2" 
      :progress="currentStep === 1 ? 50 : 100" 
    />

    <AuthPageHeader 
      :title="currentStep === 1 ? 'Crie sua conta' : 'Dados do prédio'"
      :description="currentStep === 1 ? 'Dados do administrador do sistema' : 'Onde o Reserva Aí! será instalado'"
    />

    <div class="space-y-8">
      <RegisterForm 
        v-model:currentStep="currentStep"
        :is-loading="isLoading"
        :error-msg="errorMsg"
        @submit="handleRegister"
      />
    </div>

    <AuthFooterBadges />
  </AuthLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthLayout from '../components/AuthLayout.vue'
import AuthSidebar from '../components/AuthSidebar.vue'
import AuthPageHeader from '../components/AuthPageHeader.vue'
import RegisterProgress from '../components/RegisterProgress.vue'
import AuthFooterBadges from '../components/AuthFooterBadges.vue'
import RegisterForm from '../components/RegisterForm.vue'
import type { RegisterTenantDTO } from '../../landing/landing.api'

const router = useRouter()
const isLoading = ref(false)
const currentStep = ref(1)
const errorMsg = ref('')

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
  },
  {
    title: 'Suporte Concierge',
    description: 'Equipe dedicada para auxiliar na implementação e treinamento da sua equipe.',
    icon: 'support_agent'
  }
]

const handleRegister = (formData: RegisterTenantDTO) => {
  isLoading.value = true
  errorMsg.value = ''
  
  console.log('Registering with:', formData)
  
  // Simular registro
  setTimeout(() => {
    isLoading.value = false
    router.push('/login')
  }, 2000)
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
