import AdminDashboard from './pages/AdminDashboard.vue'
import ReservationsPage from './pages/ReservationsPage.vue'
import CommonAreasPage from './pages/CommonAreasPage.vue'
import CommonAreasFormPage from './pages/CommonAreasFormPage.vue'
import ReportsPage from './pages/ReportsPage.vue'
import CondominiumSettingsPage from './pages/CondominiumSettingsPage.vue'
import ResidentsListPage from '@/modules/residents/pages/ResidentsListPage.vue'
import ResidentsDetailPage from '@/modules/residents/pages/ResidentsDetailPage.vue'
import ResidentsFormPage from '@/modules/residents/pages/ResidentsFormPage.vue'

export const adminRoutes = [
  {
    path: '/condominium/dashboard',
    name: 'admin-dashboard',
    component: AdminDashboard,
  },
  {
    path: '/condominium/residents',
    name: 'admin-residents',
    component: ResidentsListPage,
  },
  {
    path: '/condominium/residents/new',
    name: 'admin-residents-new',
    component: ResidentsFormPage,
  },
  {
    path: '/condominium/residents/:id',
    name: 'admin-residents-detail',
    component: ResidentsDetailPage,
  },
  {
    path: '/condominium/residents/:id/edit',
    name: 'admin-residents-edit',
    component: ResidentsFormPage,
  },
  {
    path: '/condominium/reservations',
    name: 'admin-reservations',
    component: ReservationsPage,
  },
  {
    path: '/condominium/common-areas',
    name: 'admin-common-areas',
    component: CommonAreasPage,
  },
  {
    path: '/condominium/common-areas/new',
    name: 'admin-common-areas-new',
    component: CommonAreasFormPage,
  },
  {
    path: '/condominium/common-areas/:id/edit',
    name: 'admin-common-areas-edit',
    component: CommonAreasFormPage,
  },
  {
    path: '/condominium/reports',
    name: 'admin-reports',
    component: ReportsPage,
  },
  {
    path: '/condominium/settings',
    name: 'admin-settings',
    component: CondominiumSettingsPage,
  },
]