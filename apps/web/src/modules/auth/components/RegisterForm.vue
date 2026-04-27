<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Step 1: Admin Data -->
    <div v-if="currentStep === 1" class="space-y-6">
      <AuthInput 
        id="adminName"
        label="Nome Completo"
        icon="person"
        v-model="form.adminName"
        placeholder="Ex: João da Silva"
        required
      />
      <AuthInput 
        id="email"
        label="E-mail"
        icon="mail"
        type="email"
        v-model="form.adminEmail"
        placeholder="exemplo@email.com"
        required
      />
      <AuthInput 
        id="password"
        label="Senha"
        icon="lock"
        :type="showPassword ? 'text' : 'password'"
        v-model="form.adminPassword"
        placeholder="Mínimo 8 caracteres"
        required
      >
        <template #right-icon>
          <button 
            type="button"
            @click="showPassword = !showPassword"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors p-1"
          >
            <span class="material-symbols-outlined text-xl">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
          </button>
        </template>
      </AuthInput>
    </div>

    <!-- Step 2: Condo Data -->
    <div v-else class="space-y-6">
      <AuthInput 
        id="condoName"
        label="Nome do Condomínio"
        icon="domain"
        v-model="form.condominiumName"
        placeholder="Ex: Residencial Vista Bella"
        required
      />
      <AuthInput 
        id="address"
        label="Endereço"
        icon="location_on"
        v-model="form.condominiumAddress"
        placeholder="Rua, Número, Bairro, Cidade"
        required
      />
    </div>

    <!-- Navigation / Submit -->
    <div class="pt-4 space-y-4">
      <button 
        v-if="currentStep === 1"
        type="button"
        @click="handleNext"
        class="w-full signature-gradient text-white font-bold py-4 rounded-xl shadow-premium hover:shadow-premium-hover active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
      >
        Próximo passo
        <span class="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
      </button>
      
      <div v-else class="space-y-3">
        <button 
          type="submit"
          :disabled="isLoading"
          class="w-full signature-gradient text-white font-bold py-4 rounded-xl shadow-premium hover:shadow-premium-hover active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
        >
          <span v-if="isLoading" class="loading-spinner"></span>
          <span v-else class="flex items-center gap-2">
            Finalizar cadastro
            <span class="material-symbols-outlined text-lg group-hover:scale-110 transition-transform">check_circle</span>
          </span>
        </button>
        <button 
          type="button"
          @click="$emit('update:currentStep', 1)"
          class="w-full text-on-surface-variant font-bold py-2 hover:text-primary transition-colors text-xs uppercase tracking-widest"
        >
          Voltar
        </button>
      </div>

      <div class="text-center">
        <p class="text-xs text-on-surface-variant">
          Já tem uma conta? 
          <router-link to="/login" class="text-primary font-bold hover:underline">Entre agora</router-link>
        </p>
      </div>

      <p v-if="errorMsg" class="text-center text-error text-xs font-bold bg-error/10 py-3 rounded-lg border border-error/20">{{ errorMsg }}</p>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import AuthInput from './AuthInput.vue'
import type { RegisterTenantDTO } from '../services/dtos/register-tenant.dto'

const props = defineProps<{
  currentStep: number
  isLoading: boolean
  errorMsg?: string
}>()

const emit = defineEmits(['submit', 'next-step', 'update:currentStep', 'submit-error'])

const showPassword = ref(false)

const form = reactive<RegisterTenantDTO>({
  condominiumName: '',
  condominiumAddress: '',
  adminName: '',
  adminEmail: '',
  adminPassword: '',
})

const handleNext = () => {
  if (form.adminName && form.adminEmail && form.adminPassword) {
    emit('update:currentStep', 2)
    emit('next-step')
  } else {
    // This could also be handled by an event or internal errorMsg
    emit('submit-error', 'Por favor, preencha todos os campos pessoais.')
  }
}

const handleSubmit = () => {
  emit('submit', form)
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
