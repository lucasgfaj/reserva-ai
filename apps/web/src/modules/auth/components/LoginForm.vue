<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <AuthInput 
      id="email"
      label="E-mail"
      icon="mail"
      type="email"
      v-model="email"
      placeholder="exemplo@email.com"
      required
      :error="validation.getError('email')"
      @blur="validateField"
    />

    <div class="space-y-2">
      <AuthInput 
        id="password"
        label="Senha"
        icon="lock"
        :type="showPassword ? 'text' : 'password'"
        v-model="password"
        placeholder="••••••••"
        required
        :error="validation.getError('password')"
        @blur="validateField"
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
      <div class="flex justify-end">
        <a href="#" class="text-xs font-bold text-primary hover:text-primary-dark transition-colors">Esqueceu a senha?</a>
      </div>
    </div>

    <button 
      type="submit"
      :disabled="isLoading"
      class="w-full signature-gradient text-white font-bold py-4 rounded-xl shadow-premium hover:shadow-premium-hover active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
    >
      <span v-if="isLoading" class="loading-spinner"></span>
      <span v-else class="flex items-center gap-2">
        Entrar agora
        <span class="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
      </span>
    </button>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AuthInput from './AuthInput.vue'
import { useValidation, type ValidationRules } from '@/modules/shared/composables/useValidation'
import { useToast } from '@/modules/shared/composables/useToast'

defineProps<{
  isLoading: boolean
}>()

const emit = defineEmits<{
  submit: [data: { email: string; password: string }]
}>()

const { error: showError } = useToast()
const validation = useValidation()

const email = ref('')
const password = ref('')
const showPassword = ref(false)

const loginRules: ValidationRules = {
  email: { required: true, email: true },
  password: { required: true },
}

const validateField = () => {
  const data = { email: email.value, password: password.value }
  validation.validate(data, loginRules)
}

const handleSubmit = () => {
  const data = { email: email.value, password: password.value }
  const isValid = validation.validate(data, loginRules)
  
  if (isValid) {
    validation.clearErrors()
    emit('submit', data)
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