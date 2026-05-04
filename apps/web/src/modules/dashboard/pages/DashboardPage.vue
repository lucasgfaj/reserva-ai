<template>
  <div class="flex min-h-screen bg-surface text-on-surface selection:bg-primary-fixed selection:text-on-primary-fixed">
    <!-- SideNavBar (Authority: JSON) -->
    <aside class="h-screen sticky left-0 w-72 flex flex-col bg-slate-50 font-headline font-semibold tracking-tight text-sm border-r border-slate-100">
      <div class="flex flex-col h-full py-8">
        <!-- Brand Identity -->
        <div class="px-8 mb-10 flex items-center gap-3">
          <div class="w-10 h-10 signature-gradient rounded-xl flex items-center justify-center text-white">
            <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">apartment</span>
          </div>
          <div>
            <h1 class="text-2xl font-black text-cyan-900 tracking-tighter leading-none">Reserva Aí!</h1>
            <p class="text-[10px] uppercase tracking-[0.2em] text-slate-400 mt-1">Administração</p>
          </div>
        </div>
        <!-- Navigation Tabs -->
        <nav class="flex-1 space-y-1">
          <!-- Início (Active State Logic Applied) -->
          <a class="flex items-center gap-4 text-cyan-900 font-bold bg-white rounded-l-full ml-4 pl-4 py-3 transition-all scale-98 active:scale-95 shadow-sm border border-r-0 border-slate-100" href="#">
            <span class="material-symbols-outlined">dashboard</span>
            <span>Início</span>
          </a>
          <a class="flex items-center gap-4 text-slate-500 px-8 py-3 hover:text-cyan-700 transition-colors duration-200" href="#">
            <span class="material-symbols-outlined">event_available</span>
            <span>Reservas</span>
          </a>
          <a class="flex items-center gap-4 text-slate-500 px-8 py-3 hover:text-cyan-700 transition-colors duration-200" href="#">
            <span class="material-symbols-outlined">group</span>
            <span>Moradores</span>
          </a>
          <a class="flex items-center gap-4 text-slate-500 px-8 py-3 hover:text-cyan-700 transition-colors duration-200" href="#">
            <span class="material-symbols-outlined">assessment</span>
            <span>Relatórios</span>
          </a>
          <a class="flex items-center gap-4 text-slate-500 px-8 py-3 hover:text-cyan-700 transition-colors duration-200" href="#">
            <span class="material-symbols-outlined">settings_suggest</span>
            <span>Configurações</span>
          </a>
        </nav>
        <!-- CTA -->
        <div class="px-8 mt-6">
          <button class="w-full signature-gradient text-white rounded-xl py-3 px-4 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity">
            <span class="material-symbols-outlined text-sm">add_circle</span>
            <span>Novo Comunicado</span>
          </button>
        </div>
        <!-- Footer Nav -->
        <div class="mt-auto border-t border-slate-100 pt-6 space-y-1">
          <a class="flex items-center gap-4 text-slate-500 px-8 py-3 hover:text-cyan-700 transition-colors duration-200" href="#">
            <span class="material-symbols-outlined">help_outline</span>
            <span>Ajuda</span>
          </a>
          <a @click="handleLogout" class="flex items-center gap-4 text-error px-8 py-3 hover:bg-error/5 transition-colors duration-200 cursor-pointer">
            <span class="material-symbols-outlined">logout</span>
            <span>Sair</span>
          </a>
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="flex-1 flex flex-col min-h-screen">
      <!-- TopAppBar (Authority: JSON) -->
      <header class="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-xl shadow-sm shadow-cyan-900/5 px-12 py-6 flex justify-between items-center">
        <div class="flex items-center gap-6 flex-1">
          <div class="relative w-full max-w-md focus-within:ring-2 focus-within:ring-cyan-500/20 rounded-xl transition-all">
            <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input class="w-full pl-12 pr-4 py-2.5 bg-surface-container-low border-none rounded-xl text-sm focus:ring-0 placeholder:text-slate-400" placeholder="Pesquisar reservas ou moradores..." type="text"/>
          </div>
        </div>
        <div class="flex items-center gap-6">
          <div class="flex items-center gap-4">
            <button class="p-2 text-slate-400 hover:text-cyan-900 transition-colors relative">
              <span class="material-symbols-outlined">notifications</span>
              <span class="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-white"></span>
            </button>
            <button class="p-2 text-slate-400 hover:text-cyan-900 transition-colors">
              <span class="material-symbols-outlined">chat_bubble</span>
            </button>
          </div>
          <div class="flex items-center gap-3 pl-6 border-l border-slate-100">
            <div class="text-right">
              <p class="text-sm font-bold text-cyan-900 leading-none">{{ userName || 'Usuário' }}</p>
              <p class="text-[11px] text-slate-400 mt-1">Síndico Profissional</p>
            </div>
            <div class="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white ring-2 ring-surface-container font-bold">
              {{ userName ? userName.charAt(0).toUpperCase() : 'U' }}
            </div>
          </div>
        </div>
      </header>

      <!-- Dashboard Content -->
      <div class="p-12 space-y-12">
        <!-- Welcome Section -->
        <section>
          <h2 class="text-3xl font-extrabold text-primary tracking-tight font-headline">Dashboard Principal</h2>
          <p class="text-on-surface-variant mt-2 font-body">Bem-vindo de volta! Aqui está o resumo das atividades do {{ condominiumName || 'Condomínio Mirante das Flores' }} hoje.</p>
        </section>

        <!-- Stats Cards (Tonal Layering Principle) -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="bg-surface-container-lowest p-6 rounded-xl relative overflow-hidden group shadow-sm">
            <div class="relative z-10">
              <p class="text-on-surface-variant text-sm font-medium">Reservas Pendentes</p>
              <h3 class="text-4xl font-black text-primary mt-3">8</h3>
              <div class="mt-4 inline-flex items-center gap-1.5 py-1 px-3 bg-secondary-container text-on-secondary-container rounded-full text-xs font-semibold">
                <span class="material-symbols-outlined text-[14px]">arrow_upward</span>
                <span>+12%</span>
              </div>
            </div>
            <span class="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl text-primary/5 -rotate-12 group-hover:rotate-0 transition-transform duration-500">pending_actions</span>
          </div>
          <div class="bg-surface-container-lowest p-6 rounded-xl relative overflow-hidden group shadow-sm">
            <div class="relative z-10">
              <p class="text-on-surface-variant text-sm font-medium">Total de Moradores</p>
              <h3 class="text-4xl font-black text-primary mt-3">412</h3>
              <p class="text-xs text-slate-400 mt-4">120 unidades ocupadas</p>
            </div>
            <span class="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl text-primary/5 -rotate-12 group-hover:rotate-0 transition-transform duration-500">group</span>
          </div>
          <div class="bg-surface-container-lowest p-6 rounded-xl relative overflow-hidden group shadow-sm">
            <div class="relative z-10">
              <p class="text-on-surface-variant text-sm font-medium">Ocupação de Áreas</p>
              <h3 class="text-4xl font-black text-primary mt-3">84.2%</h3>
              <div class="w-full bg-surface-container-high h-1.5 rounded-full mt-5">
                <div class="bg-tertiary h-full rounded-full" style="width: 84.2%"></div>
              </div>
            </div>
            <span class="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl text-primary/5 -rotate-12 group-hover:rotate-0 transition-transform duration-500">analytics</span>
          </div>
          <div class="bg-surface-container-lowest p-6 rounded-xl relative overflow-hidden group shadow-sm">
            <div class="relative z-10">
              <p class="text-on-surface-variant text-sm font-medium">Avisos Ativos</p>
              <h3 class="text-4xl font-black text-primary mt-3">3</h3>
              <div class="mt-4 inline-flex items-center gap-1.5 py-1 px-3 bg-error-container text-on-error-container rounded-full text-xs font-semibold">
                <span class="material-symbols-outlined text-[14px]">priority_high</span>
                <span>1 crítico</span>
              </div>
            </div>
            <span class="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl text-primary/5 -rotate-12 group-hover:rotate-0 transition-transform duration-500">campaign</span>
          </div>
        </div>

        <!-- Main Grid Layout -->
        <div class="grid grid-cols-12 gap-8">
          <!-- Left Column: Reservations -->
          <div class="col-span-12 lg:col-span-7 space-y-6">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-xl font-bold text-cyan-900 tracking-tight">Próximas Reservas</h3>
              <button class="text-sm font-semibold text-primary hover:underline">Ver calendário completo</button>
            </div>
            
            <div class="space-y-4">
              <!-- Reservation Item 1 -->
              <div class="bg-surface-container-lowest p-5 rounded-xl flex items-center justify-between group hover:bg-white shadow-sm transition-colors cursor-pointer">
                <div class="flex items-center gap-5">
                  <div class="w-14 h-14 bg-surface-container-low rounded-xl overflow-hidden flex items-center justify-center text-primary/50">
                    <span class="material-symbols-outlined text-3xl">celebration</span>
                  </div>
                  <div>
                    <h4 class="font-bold text-cyan-950">Salão de Festas</h4>
                    <p class="text-sm text-slate-500 flex items-center gap-2 mt-1">
                      <span class="material-symbols-outlined text-sm">schedule</span>
                      Hoje, 18:00 - 23:00
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-6 text-right">
                  <div>
                    <p class="text-xs font-medium text-slate-400">Morador</p>
                    <p class="text-sm font-semibold text-cyan-900">Carlos Magno (Ap. 142)</p>
                  </div>
                  <span class="py-1.5 px-4 bg-tertiary-container text-on-tertiary-fixed rounded-full text-[11px] font-bold uppercase tracking-wider">Confirmado</span>
                </div>
              </div>

              <!-- Reservation Item 2 -->
              <div class="bg-surface-container-lowest p-5 rounded-xl flex items-center justify-between group hover:bg-white shadow-sm transition-colors cursor-pointer">
                <div class="flex items-center gap-5">
                  <div class="w-14 h-14 bg-surface-container-low rounded-xl overflow-hidden flex items-center justify-center text-primary/50">
                    <span class="material-symbols-outlined text-3xl">restaurant</span>
                  </div>
                  <div>
                    <h4 class="font-bold text-cyan-950">Espaço Gourmet</h4>
                    <p class="text-sm text-slate-500 flex items-center gap-2 mt-1">
                      <span class="material-symbols-outlined text-sm">schedule</span>
                      Amanhã, 12:00 - 16:00
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-6 text-right">
                  <div>
                    <p class="text-xs font-medium text-slate-400">Morador</p>
                    <p class="text-sm font-semibold text-cyan-900">Ana Luiza (Ap. 12)</p>
                  </div>
                  <span class="py-1.5 px-4 bg-secondary-container text-on-secondary-container rounded-full text-[11px] font-bold uppercase tracking-wider">Pendente</span>
                </div>
              </div>

              <!-- Reservation Item 3 -->
              <div class="bg-surface-container-lowest p-5 rounded-xl flex items-center justify-between group hover:bg-white shadow-sm transition-colors cursor-pointer">
                <div class="flex items-center gap-5">
                  <div class="w-14 h-14 bg-surface-container-low rounded-xl overflow-hidden flex items-center justify-center text-primary/50">
                    <span class="material-symbols-outlined text-3xl">pool</span>
                  </div>
                  <div>
                    <h4 class="font-bold text-cyan-950">Piscina Privativa</h4>
                    <p class="text-sm text-slate-500 flex items-center gap-2 mt-1">
                      <span class="material-symbols-outlined text-sm">schedule</span>
                      Sáb, 09:00 - 13:00
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-6 text-right">
                  <div>
                    <p class="text-xs font-medium text-slate-400">Morador</p>
                    <p class="text-sm font-semibold text-cyan-900">Roberto Silva (Ap. 205)</p>
                  </div>
                  <span class="py-1.5 px-4 bg-tertiary-container text-on-tertiary-fixed rounded-full text-[11px] font-bold uppercase tracking-wider">Confirmado</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column -->
          <div class="col-span-12 lg:col-span-5 space-y-8">
            <!-- Quick Actions (Asymmetric Layout) -->
            <section>
              <h3 class="text-lg font-bold text-cyan-900 mb-5">Ações Rápidas</h3>
              <div class="grid grid-cols-2 gap-4">
                <button class="bg-primary text-white p-6 rounded-xl text-left flex flex-col justify-between h-32 hover:translate-y-[-4px] transition-transform shadow-lg shadow-primary/10 group">
                  <span class="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">campaign</span>
                  <span class="font-bold text-sm leading-tight">Novo Comunicado Geral</span>
                </button>
                <button class="bg-surface-container-lowest p-6 rounded-xl text-left flex flex-col justify-between h-32 hover:translate-y-[-4px] transition-transform shadow-sm group border border-slate-100">
                  <span class="material-symbols-outlined text-3xl text-cyan-900 group-hover:scale-110 transition-transform">description</span>
                  <span class="font-bold text-sm text-cyan-900 leading-tight">Gerar Relatório de Ocupação</span>
                </button>
              </div>
            </section>

            <!-- Recent Activities -->
            <section>
              <div class="flex items-center justify-between mb-5">
                <h3 class="text-lg font-bold text-cyan-900">Atividades Recentes</h3>
                <button class="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors">
                  <span class="material-symbols-outlined">more_horiz</span>
                </button>
              </div>
              
              <div class="space-y-6">
                <div class="flex gap-4">
                  <div class="flex-shrink-0 w-8 h-8 rounded-full bg-tertiary/10 flex items-center justify-center">
                    <span class="material-symbols-outlined text-tertiary text-sm">mail</span>
                  </div>
                  <div>
                    <p class="text-sm text-cyan-950 leading-snug">
                      <span class="font-bold">Comunicado enviado:</span> Manutenção programada dos elevadores agendada para 15/10.
                    </p>
                    <p class="text-[11px] text-slate-400 mt-1 uppercase font-bold tracking-wider">há 2 horas</p>
                  </div>
                </div>

                <div class="flex gap-4">
                  <div class="flex-shrink-0 w-8 h-8 rounded-full bg-secondary-container/20 flex items-center justify-center">
                    <span class="material-symbols-outlined text-secondary text-sm">person_add</span>
                  </div>
                  <div>
                    <p class="text-sm text-cyan-950 leading-snug">
                      <span class="font-bold">Novo morador:</span> Marina Albuquerque foi cadastrada no Ap. 302, Bloco B.
                    </p>
                    <p class="text-[11px] text-slate-400 mt-1 uppercase font-bold tracking-wider">há 5 horas</p>
                  </div>
                </div>

                <div class="flex gap-4">
                  <div class="flex-shrink-0 w-8 h-8 rounded-full bg-error/10 flex items-center justify-center">
                    <span class="material-symbols-outlined text-error text-sm">report_problem</span>
                  </div>
                  <div>
                    <p class="text-sm text-cyan-950 leading-snug">
                      <span class="font-bold">Ocorrência registrada:</span> Vazamento reportado na área comum da churrasqueira.
                    </p>
                    <p class="text-[11px] text-slate-400 mt-1 uppercase font-bold tracking-wider">Ontem</p>
                  </div>
                </div>
              </div>
            </section>
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
.font-headline { font-family: 'Manrope', sans-serif; }
.font-body { font-family: 'Inter', sans-serif; }
.material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
.glass-panel { backdrop-filter: blur(20px); }
.signature-gradient { background: linear-gradient(135deg, #004d75 0%, #006699 100%); }
</style>