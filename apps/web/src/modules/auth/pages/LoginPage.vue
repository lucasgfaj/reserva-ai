<template>
  <div class="login-wrapper">
    <div class="glass-card">
      <h2 class="card-title">Login - Reserva Aí!</h2>
      <form @submit.prevent="submit" class="form">
        <div class="input-group">
          <label>Email</label>
          <input v-model="email" type="email" placeholder="seu-email@condominio.com" required />
        </div>
        <div class="input-group">
          <label>Senha</label>
          <input v-model="password" type="password" placeholder="••••••••" required />
        </div>
        <button type="submit" class="submit-btn" :disabled="isLoading">
          {{ isLoading ? 'Entrando...' : 'Entrar' }}
        </button>
        <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
      </form>
      <div class="back-link">
        <router-link to="/">← Voltar para o Início</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { loginRequest } from '../auth.api'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMsg = ref('')

const submit = async () => {
  isLoading.value = true
  errorMsg.value = ''
  try {
    const data = await loginRequest({ email: email.value, password: password.value })
    localStorage.setItem('token', data.access_token)
    router.push('/')
  } catch (error: any) {
    errorMsg.value = 'Falha no login. Verifique suas credenciais.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
}

.glass-card {
  width: 100%;
  max-width: 420px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
  backdrop-filter: blur(12px);
  border-radius: 16px;
  padding: 2.5rem;
}

.card-title {
  font-size: 1.8rem;
  margin-bottom: 2rem;
  text-align: center;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-group label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-heading);
}

.input-group input {
  padding: 0.75rem 1rem;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  border-radius: 8px;
  font-family: inherit;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.input-group input:focus {
  outline: none;
  border-color: var(--color-primary);
  background: rgba(15, 23, 42, 0.8);
}

.submit-btn {
  margin-top: 1rem;
  padding: 0.9rem;
  background-color: var(--color-primary);
  color: #fff;
  font-family: inherit;
  font-weight: 600;
  font-size: 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.submit-btn:hover {
  background-color: var(--color-primary-dark);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-msg {
  color: #ef4444;
  font-size: 0.9rem;
  text-align: center;
}

.back-link {
  margin-top: 1.5rem;
  text-align: center;
}

.back-link a {
  font-size: 0.9rem;
}
</style>
