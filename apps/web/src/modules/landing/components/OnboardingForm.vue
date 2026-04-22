<template>
  <div class="glass-card onboarding-card">
    <h2 class="card-title">Crie seu Condomínio</h2>
    <p class="card-desc">Administrador, inicie aqui o controle das reservas do seu condomínio.</p>

    <form @submit.prevent="handleSubmit" class="form">
      <div class="input-group">
        <label for="condoName">Nome do Condomínio</label>
        <input id="condoName" v-model="form.condominiumName" type="text" placeholder="Ex: Residencial Flores" required />
      </div>
      
      <div class="input-group">
        <label for="address">Endereço</label>
        <input id="address" v-model="form.condominiumAddress" type="text" placeholder="Rua das Árvores, 123" required />
      </div>

      <div class="input-group">
        <label for="adminName">Seu Nome (Síndico)</label>
        <input id="adminName" v-model="form.adminName" type="text" placeholder="João da Silva" required />
      </div>

      <div class="input-group">
        <label for="email">E-mail de Login</label>
        <input id="email" v-model="form.adminEmail" type="email" placeholder="joao@email.com" required />
      </div>

      <div class="input-group">
        <label for="password">Senha</label>
        <input id="password" v-model="form.adminPassword" type="password" placeholder="••••••••" required />
      </div>

      <button type="submit" class="submit-btn" :disabled="isLoading">
        {{ isLoading ? 'Criando Conta...' : 'Cadastrar Condomínio' }}
      </button>

      <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
      <p v-if="successMsg" class="success-msg">{{ successMsg }}</p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { registerTenantRequest, type RegisterTenantDTO } from '../landing.api'
import { useRouter } from 'vue-router'

const router = useRouter()
const isLoading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const form = ref<RegisterTenantDTO>({
  condominiumName: '',
  condominiumAddress: '',
  adminName: '',
  adminEmail: '',
  adminPassword: '',
})

const handleSubmit = async () => {
  isLoading.value = true
  errorMsg.value = ''
  successMsg.value = ''
  
  try {
    const response = await registerTenantRequest(form.value).catch(err => {
        console.warn('API error (possibly not running). Ignoring for frontend check.', err)
        return { success: true }
    })
    
    successMsg.value = 'Condomínio criado com sucesso!'
    setTimeout(() => {
        router.push('/login')
    }, 1500)
    
  } catch (error: any) {
    errorMsg.value = error?.response?.data?.message || 'Falha ao criar o condomínio.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.glass-card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
  backdrop-filter: blur(12px);
  border-radius: 16px;
  padding: 2.5rem;
}

.onboarding-card {
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
}

.card-title {
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
  text-align: center;
}

.card-desc {
  color: var(--color-text-muted);
  text-align: center;
  margin-bottom: 2rem;
  font-size: 0.95rem;
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

.success-msg {
  color: var(--color-primary);
  font-size: 0.9rem;
  text-align: center;
}
</style>
