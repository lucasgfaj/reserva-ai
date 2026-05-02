<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow-sm">
      <div class="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div class="flex items-center gap-2">
          <span class="font-manrope font-extrabold text-sky-900 text-xl">Reserva Aí!</span>
          <span class="text-gray-400">|</span>
          <span class="font-manrope text-gray-600">{{ condominiumName }}</span>
        </div>
        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-600">{{ userName }}</span>
          <button 
            @click="handleLogout"
            class="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Sair
          </button>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-6 py-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-3xl text-primary">calendar_month</span>
            <div>
              <p class="text-2xl font-bold text-gray-900">0</p>
              <p class="text-sm text-gray-500">Reservas</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl p-6 shadow-sm">
          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-3xl text-primary">groups</span>
            <div>
              <p class="text-2xl font-bold text-gray-900">0</p>
              <p class="text-sm text-gray-500">Moradores</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl p-6 shadow-sm">
          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-3xl text-primary">meeting_room</span>
            <div>
              <p class="text-2xl font-bold text-gray-900">0</p>
              <p class="text-sm text-gray-500">Áreas Comuns</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '@/modules/auth/services/auth.service'
import { http } from '@/api/http'

const router = useRouter()
const userName = ref('')
const condominiumName = ref('')

onMounted(() => {
  const user = authService.getUser()
  const condo = localStorage.getItem('auth_condo')
  
  if (user) {
    userName.value = user.name
  }
  
  if (condo) {
    const condoData = JSON.parse(condo)
    condominiumName.value = condoData.name
  }
})

const handleLogout = async () => {
  try {
    await http.post('/auth/logout')
  } catch {
    // Ignora erro
  }
  
  authService.logout()
  router.push('/')
}
</script>

<style scoped>
.font-manrope { font-family: 'Manrope', sans-serif; }
</style>