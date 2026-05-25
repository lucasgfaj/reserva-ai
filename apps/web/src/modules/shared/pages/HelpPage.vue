<template>
  <div class="flex min-h-screen bg-surface text-on-surface">
    <SideNavBar
      :role="userRole"
      :userName="userName"
      :collapsed="sidebarCollapsed"
      @toggle-collapse="toggleCollapse"
      @logout="handleLogout"
      @cta-click="handleQuickAction"
      :class="['transition-transform duration-300', sidebarOpen ? 'translate-x-0' : '-translate-x-full', 'fixed z-50', 'md:translate-x-0']"
    />
    <main :class="['flex-1 flex flex-col min-h-screen w-full transition-all duration-300', sidebarCollapsed ? 'md:ml-16' : 'md:ml-72']">
      <TopAppBar
        :userName="userName"
        :userRole="userRole"
        @toggle-sidebar="sidebarOpen = !sidebarOpen"
      />

      <div class="flex-1 p-4 md:p-6 lg:p-8 w-full max-w-full">
        <div class="max-w-4xl mx-auto">
          <!-- Header -->
          <div class="flex items-center gap-3 mb-8">
            <div class="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <span class="material-symbols-outlined text-primary">help</span>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-cyan-900">Ajuda</h1>
              <p class="text-sm text-slate-500">Conheça todas as funcionalidades do sistema</p>
            </div>
          </div>

          <!-- Content -->
          <div class="space-y-6">
            <div
              v-for="(section, idx) in helpSections"
              :key="idx"
              class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
            >
              <div class="p-6 md:p-8">
                <div class="flex items-center gap-3 mb-4">
                  <div class="w-9 h-9 rounded-lg flex items-center justify-center" :class="section.bgClass">
                    <span class="material-symbols-outlined text-lg" :class="section.iconClass">{{ section.icon }}</span>
                  </div>
                  <h2 class="text-lg font-bold text-cyan-900">{{ section.title }}</h2>
                </div>
                <p class="text-slate-600 leading-relaxed">{{ section.description }}</p>
                <div v-if="section.items" class="mt-4 space-y-3">
                  <div
                    v-for="(item, iidx) in section.items"
                    :key="iidx"
                    class="flex items-start gap-3 p-3 bg-slate-50 rounded-xl"
                  >
                    <span class="material-symbols-outlined text-sm text-primary mt-0.5">check_circle</span>
                    <div>
                      <p class="text-sm font-semibold text-slate-700">{{ item.title }}</p>
                      <p class="text-sm text-slate-500 mt-0.5">{{ item.description }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <div v-if="sidebarOpen" class="fixed inset-0 bg-black/50 z-40 md:hidden" @click="sidebarOpen = false"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import SideNavBar from '@/modules/shared/components/SideNavBar.vue'
import TopAppBar from '@/modules/shared/components/TopAppBar.vue'
import { authService } from '@/modules/auth/services/auth.service'
import { http } from '@/api/http'
import { useSidebar } from '@/modules/shared/composables/useSidebar'
import type { UserRole } from '@/modules/shared/config/menuConfig'

const router = useRouter()
const { sidebarOpen, sidebarCollapsed, toggleCollapse } = useSidebar()

const user = authService.getUser()
const userName = ref(user?.name || '')
const userRole = ref<UserRole>((user?.role as UserRole) || 'RESIDENT')

interface HelpItem {
  title: string
  description: string
}

interface HelpSection {
  icon: string
  title: string
  description: string
  bgClass: string
  iconClass: string
  items?: HelpItem[]
}

const residentSections: HelpSection[] = [
  {
    icon: 'dashboard',
    title: 'Painel Inicial',
    description: 'Ao acessar o sistema como morador, você verá um dashboard com um resumo das suas próximas reservas, áreas disponíveis e atalhos rápidos para as principais funcionalidades.',
    bgClass: 'bg-sky-100',
    iconClass: 'text-sky-600',
  },
  {
    icon: 'pool',
    title: 'Áreas Comuns',
    description: 'Navegue por todas as áreas comuns do condomínio (salão de festas, churrasqueira, piscina, etc.). Veja detalhes como capacidade, horário de funcionamento, dias de operação e se a área está em manutenção.',
    bgClass: 'bg-cyan-100',
    iconClass: 'text-cyan-600',
  },
  {
    icon: 'calendar_month',
    title: 'Disponibilidade',
    description: 'Consulte a disponibilidade de qualquer área comum em uma data específica. O calendário mostra os dias ocupados e livres, e você pode visualizar a timeline do dia com os horários disponíveis para reserva.',
    bgClass: 'bg-emerald-100',
    iconClass: 'text-emerald-600',
  },
  {
    icon: 'event_available',
    title: 'Minhas Reservas',
    description: 'Gerencie todas as suas reservas em um só lugar. É possível criar novas reservas, visualizar reservas futuras e anteriores, e cancelar reservas pendentes ou confirmadas.',
    bgClass: 'bg-violet-100',
    iconClass: 'text-violet-600',
    items: [
      { title: 'Criar reserva', description: 'Selecione a área, data e horário desejado. O sistema verifica conflitos automaticamente.' },
      { title: 'Filtrar reservas', description: 'Use os filtros para ver reservas futuras, anteriores, pendentes, confirmadas ou canceladas.' },
      { title: 'Cancelar reserva', description: 'Reservas pendentes ou confirmadas podem ser canceladas. Após o horário da reserva, o cancelamento não fica mais disponível.' },
    ],
  },
  {
    icon: 'campaign',
    title: 'Comunicados',
    description: 'Acompanhe os comunicados e avisos publicados pela administração do condomínio. Fique por dentro de novidades, manutenções programadas e eventos.',
    bgClass: 'bg-amber-100',
    iconClass: 'text-amber-600',
  },
  {
    icon: 'manage_accounts',
    title: 'Configurações da Conta',
    description: 'Gerencie suas informações pessoais, altere sua senha e configure preferências de segurança.',
    bgClass: 'bg-slate-100',
    iconClass: 'text-slate-600',
  },
]

const adminSections: HelpSection[] = [
  {
    icon: 'dashboard',
    title: 'Painel Administrativo',
    description: 'O dashboard do administrador exibe um resumo das atividades recentes do condomínio, incluindo novas reservas, cancelamentos e comunicados publicados.',
    bgClass: 'bg-sky-100',
    iconClass: 'text-sky-600',
  },
  {
    icon: 'apartment',
    title: 'Condomínio',
    description: 'Configure as informações gerais do condomínio, como nome, endereço e outras configurações administrativas.',
    bgClass: 'bg-slate-100',
    iconClass: 'text-slate-600',
  },
  {
    icon: 'group',
    title: 'Moradores',
    description: 'Gerencie os moradores do condomínio. Cadastre novos moradores, edite informações e visualize detalhes de cada residente.',
    bgClass: 'bg-blue-100',
    iconClass: 'text-blue-600',
    items: [
      { title: 'Cadastrar morador', description: 'Adicione novos moradores ao condomínio com suas informações e contato.' },
      { title: 'Editar morador', description: 'Atualize dados cadastrais de moradores existentes.' },
    ],
  },
  {
    icon: 'pool',
    title: 'Áreas Comuns',
    description: 'Administre as áreas comuns do condomínio. Cadastre novas áreas, edite horários de funcionamento, capacidade, e gerencie manutenções.',
    bgClass: 'bg-cyan-100',
    iconClass: 'text-cyan-600',
    items: [
      { title: 'Cadastrar área', description: 'Adicione novas áreas comuns com nome, descrição, capacidade e horários.' },
      { title: 'Editar área', description: 'Altere configurações de áreas existentes, incluindo dias de operação.' },
      { title: 'Gerenciar manutenção', description: 'Ative o modo de manutenção para bloquear reservas em uma área.' },
    ],
  },
  {
    icon: 'event_available',
    title: 'Reservas',
    description: 'Visualize e gerencie todas as reservas do condomínio. Aprove, rejeite ou cancele reservas conforme necessário.',
    bgClass: 'bg-violet-100',
    iconClass: 'text-violet-600',
    items: [
      { title: 'Aprovar reserva', description: 'Reservas pendentes podem ser aprovadas para confirmar o agendamento.' },
      { title: 'Rejeitar reserva', description: 'Reservas que não atendem aos critérios podem ser rejeitadas.' },
      { title: 'Cancelar reserva', description: 'Cancelar reservas ativas quando necessário.' },
    ],
  },
  {
    icon: 'calendar_month',
    title: 'Disponibilidade',
    description: 'Consulte a disponibilidade de qualquer área comum em uma data específica, visualize horários ocupados e livres.',
    bgClass: 'bg-emerald-100',
    iconClass: 'text-emerald-600',
  },
  {
    icon: 'campaign',
    title: 'Comunicados',
    description: 'Crie e gerencie comunicados para os moradores. Publique avisos sobre manutenções, eventos e outras informações importantes.',
    bgClass: 'bg-amber-100',
    iconClass: 'text-amber-600',
  },
  {
    icon: 'assessment',
    title: 'Relatórios',
    description: 'Acesse relatórios completos sobre o uso das áreas comuns, incluindo taxas de ocupação, cancelamentos e estatísticas por área.',
    bgClass: 'bg-rose-100',
    iconClass: 'text-rose-600',
  },
  {
    icon: 'manage_accounts',
    title: 'Configurações da Conta',
    description: 'Gerencie suas informações de acesso e segurança.',
    bgClass: 'bg-slate-100',
    iconClass: 'text-slate-600',
  },
]

const helpSections = computed(() => {
  return userRole.value === 'ADMIN' ? adminSections : residentSections
})

function handleQuickAction(actionId: string) {
  if (actionId === 'new-reservation') router.push('/resident/reservations/new')
}

const handleLogout = async () => {
  try { await http.post('/auth/logout') } catch {}
  authService.logout()
  router.push('/')
}
</script>

<style scoped>
.material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>
