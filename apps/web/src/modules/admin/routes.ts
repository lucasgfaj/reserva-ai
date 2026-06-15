import AdminDashboard from './pages/AdminDashboard.vue'
import ReservationsPage from './pages/ReservationsPage.vue'
import CommonAreasPage from './pages/CommonAreasPage.vue'
import CommonAreasFormPage from './pages/CommonAreasFormPage.vue'
import ReportsPage from './pages/ReportsPage.vue'
import CondominiumSettingsPage from './pages/CondominiumSettingsPage.vue'
import ResidentsListPage from '@/modules/residents/pages/ResidentsListPage.vue'
import ResidentsDetailPage from '@/modules/residents/pages/ResidentsDetailPage.vue'
import ResidentsFormPage from '@/modules/residents/pages/ResidentsFormPage.vue'
import AvailabilityPage from '@/modules/resident/pages/AvailabilityPage.vue'
import AnnouncementsPage from './pages/AnnouncementsPage.vue'
import AccountSettingsPage from './pages/AccountSettingsPage.vue'
import HelpPage from '@/modules/shared/pages/HelpPage.vue'
import BlocksListPage from '@/modules/blocks/pages/BlocksListPage.vue'
import BlocksFormPage from '@/modules/blocks/pages/BlocksFormPage.vue'
import UnitsListPage from '@/modules/units/pages/UnitsListPage.vue'
import UnitsFormPage from '@/modules/units/pages/UnitsFormPage.vue'

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
    path: '/condominium/blocks',
    name: 'admin-blocks',
    component: BlocksListPage,
  },
  {
    path: '/condominium/blocks/new',
    name: 'admin-blocks-new',
    component: BlocksFormPage,
  },
  {
    path: '/condominium/blocks/:id/edit',
    name: 'admin-blocks-edit',
    component: BlocksFormPage,
  },
  {
    path: '/condominium/units',
    name: 'admin-units',
    component: UnitsListPage,
  },
  {
    path: '/condominium/units/new',
    name: 'admin-units-new',
    component: UnitsFormPage,
  },
  {
    path: '/condominium/units/:id/edit',
    name: 'admin-units-edit',
    component: UnitsFormPage,
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
  {
    path: '/condominium/availability',
    name: 'admin-availability',
    component: AvailabilityPage,
  },
  {
    path: '/condominium/announcements',
    name: 'admin-announcements',
    component: AnnouncementsPage,
  },
  {
    path: '/condominium/settings/account',
    name: 'admin-account-settings',
    component: AccountSettingsPage,
  },
  {
    path: '/condominium/help',
    name: 'admin-help',
    component: HelpPage,
  },
]