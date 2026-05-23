export type UserRole = 'ADMIN' | 'RESIDENT' | 'SUPER_ADMIN'

export interface MenuItem {
  path: string
  label: string
  icon: string
}

export interface RoleConfig {
  subtitle: string
  ctaLabel: string
  ctaIcon: string
}

export const menuConfig: Record<UserRole, MenuItem[]> = {
  ADMIN: [
    { path: '/condominium/dashboard', label: 'Início', icon: 'dashboard' },
    { path: '/condominium/settings', label: 'Condomínio', icon: 'apartment' },
    { path: '/condominium/residents', label: 'Moradores', icon: 'group' },
    { path: '/condominium/common-areas', label: 'Áreas Comuns', icon: 'pool' },
    { path: '/condominium/reservations', label: 'Reservas', icon: 'event_available' },
    { path: '/condominium/availability', label: 'Disponibilidade', icon: 'calendar_month' },
    { path: '/condominium/reports', label: 'Relatórios', icon: 'assessment' },
  ],
  RESIDENT: [
    { path: '/resident/dashboard', label: 'Início', icon: 'dashboard' },
    { path: '/resident/common-areas', label: 'Áreas Comuns', icon: 'pool' },
    { path: '/resident/availability', label: 'Disponibilidade', icon: 'calendar_month' },
    { path: '/resident/reservations', label: 'Minhas Reservas', icon: 'event_available' },
  ],
  SUPER_ADMIN: [
    { path: '/super/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/super/condominiums', label: 'Condomínios', icon: 'apartment' },
  ],
}

export const roleConfig: Record<UserRole, RoleConfig> = {
  ADMIN: {
    subtitle: 'Administração',
    ctaLabel: 'Novo Comunicado',
    ctaIcon: 'add_circle',
  },
  RESIDENT: {
    subtitle: 'Morador',
    ctaLabel: 'Nova Reserva',
    ctaIcon: 'add_circle',
  },
  SUPER_ADMIN: {
    subtitle: 'Super Admin',
    ctaLabel: 'Painel Global',
    ctaIcon: 'settings',
  },
}