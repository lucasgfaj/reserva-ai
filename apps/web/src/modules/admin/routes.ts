import AdminDashboard from './pages/AdminDashboard.vue'
import ReservationsPage from './pages/ReservationsPage.vue'
import CommonAreasPage from './pages/CommonAreasPage.vue'
import ResidentsListPage from '@/modules/residents/pages/ResidentsListPage.vue'
import ResidentsDetailPage from '@/modules/residents/pages/ResidentsDetailPage.vue'
import ResidentsFormPage from '@/modules/residents/pages/ResidentsFormPage.vue'

export const adminRoutes = [
  {
    path: '/admin/dashboard',
    name: 'admin-dashboard',
    component: AdminDashboard,
  },
  {
    path: '/admin/residents',
    name: 'admin-residents',
    component: ResidentsListPage,
  },
  {
    path: '/admin/residents/new',
    name: 'admin-residents-new',
    component: ResidentsFormPage,
  },
  {
    path: '/admin/residents/:id',
    name: 'admin-residents-detail',
    component: ResidentsDetailPage,
  },
  {
    path: '/admin/residents/:id/edit',
    name: 'admin-residents-edit',
    component: ResidentsFormPage,
  },
  {
    path: '/admin/reservations',
    name: 'admin-reservations',
    component: ReservationsPage,
  },
  {
    path: '/admin/common-areas',
    name: 'admin-common-areas',
    component: CommonAreasPage,
  },
]