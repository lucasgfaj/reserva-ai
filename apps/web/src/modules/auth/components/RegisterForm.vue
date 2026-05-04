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
        :error="validation.getError('adminName')"
        @blur="validateField('adminName')"
      />
      <AuthInput 
        id="email"
        label="E-mail"
        icon="mail"
        type="email"
        v-model="form.adminEmail"
        placeholder="exemplo@email.com"
        required
        :error="validation.getError('adminEmail')"
        @blur="validateField('adminEmail')"
      />
      <AuthInput 
        id="password"
        label="Senha"
        icon="lock"
        :type="showPassword ? 'text' : 'password'"
        v-model="form.adminPassword"
        placeholder="Mínimo 8 caracteres"
        required
        :error="validation.getError('adminPassword')"
        @blur="validateField('adminPassword')"
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
        :error="validation.getError('condominiumName')"
        @blur="validateField('condominiumName')"
      />
      <AuthInput 
        id="address"
        label="Endereço"
        icon="location_on"
        v-model="form.condominiumAddress"
        placeholder="Rua, Número, Bairro, Cidade"
        required
        :error="validation.getError('condominiumAddress')"
        @blur="validateField('condominiumAddress')"
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

      <p v-if="errorMsg" class="text-center text-error text-xs font-bold bg-error/10 py-3 rounded-lg border border-error/20">
        {{ errorMsg }}
      </p>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, reactive, toRaw } from 'vue'
import AuthInput from './AuthInput.vue'
import { useValidation, type ValidationRules } from '@/modules/shared/composables/useValidation'
import { useToast } from '@/modules/shared/composables/useToast'
import type { RegisterTenantDTO } from '../services/dtos/register-tenant.dto'

const props = defineProps<{
  currentStep: number
  isLoading: boolean
  errorMsg?: string
}>()

const emit = defineEmits(['submit', 'next-step', 'update:currentStep'])

const { success: showSuccess, error: showError } = useToast()
const validation = useValidation()

const showPassword = ref(false)

const form = reactive<RegisterTenantDTO>({
  condominiumName: '',
  condominiumAddress: '',
  adminName: '',
  adminEmail: '',
  adminPassword: '',
})

const step1Rules: ValidationRules = {
  adminName: { required: true, minLength: 3 },
  adminEmail: { required: true, email: true },
  adminPassword: { required: true, minLength: 8, password: true },
}

const step2Rules: ValidationRules = {
  condominiumName: { required: true, minLength: 3 },
  condominiumAddress: { required: true, minLength: 5 },
}

const validateField = (field: keyof typeof form) => {
  const rules = props.currentStep === 1 ? step1Rules : step2Rules
  if (rules[field]) {
    const data = toRaw(form)
    const fieldValue: Record<string, string> = { [field]: data[field] }
    validation.validate(fieldValue, { [field]: rules[field] })
  }
}

const handleNext = () => {
  const data = { adminName: form.adminName, adminEmail: form.adminEmail, adminPassword: form.adminPassword }
  const isValid = validation.validate(data, step1Rules)
  
  if (isValid) {
    validation.clearErrors()
    emit('update:currentStep', 2)
    emit('next-step')
  } else {
    const firstError = Object.values(validation.errors.value)[0]
    if (firstError) showError(firstError)
  }
}

const handleSubmit = () => {
  const data = { condominiumName: form.condominiumName, condominiumAddress: form.condominiumAddress }
  const isValid = validation.validate(data, step2Rules)
  
  if (isValid) {
    validation.clearErrors()
    emit('submit', toRaw(form))
  } else {
    const firstError = Object.values(validation.errors.value)[0]
    if (firstError) showError(firstError)
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