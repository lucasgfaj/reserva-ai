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
    { path: '/admin/dashboard', label: 'Início', icon: 'dashboard' },
    { path: '/admin/reservations', label: 'Reservas', icon: 'event_available' },
    { path: '/admin/residents', label: 'Moradores', icon: 'group' },
    { path: '/admin/common-areas', label: 'Áreas Comuns', icon: 'pool' },
    { path: '/admin/reports', label: 'Relatórios', icon: 'assessment' },
  ],
  RESIDENT: [
    { path: '/resident/dashboard', label: 'Início', icon: 'dashboard' },
    { path: '/resident/reservations', label: 'Minhas Reservas', icon: 'event_available' },
    { path: '/resident/common-areas', label: 'Áreas Comuns', icon: 'pool' },
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