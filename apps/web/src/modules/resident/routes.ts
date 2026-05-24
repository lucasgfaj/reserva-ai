import ResidentDashboard from './pages/ResidentDashboard.vue'
import CommonAreasListPage from './pages/CommonAreasListPage.vue'
import CommonAreaDetailPage from './pages/CommonAreaDetailPage.vue'
import MyReservationsPage from './pages/MyReservationsPage.vue'
import AvailabilityPage from './pages/AvailabilityPage.vue'
import NewReservationPage from './pages/NewReservationPage.vue'
import AnnouncementsPage from './pages/AnnouncementsPage.vue'
import SettingsPage from './pages/SettingsPage.vue'
import HelpPage from '@/modules/shared/pages/HelpPage.vue'

export const residentRoutes = [
  {
    path: '/resident/dashboard',
    name: 'resident-dashboard',
    component: ResidentDashboard,
  },
  {
    path: '/resident/common-areas',
    name: 'resident-common-areas',
    component: CommonAreasListPage,
  },
  {
    path: '/resident/common-areas/:id',
    name: 'resident-common-area-detail',
    component: CommonAreaDetailPage,
  },
  {
    path: '/resident/reservations',
    name: 'resident-reservations',
    component: MyReservationsPage,
  },
  {
    path: '/resident/availability',
    name: 'resident-availability',
    component: AvailabilityPage,
  },
  {
    path: '/resident/reservations/new',
    name: 'resident-reservations-new',
    component: NewReservationPage,
  },
  {
    path: '/resident/announcements',
    name: 'resident-announcements',
    component: AnnouncementsPage,
  },
  {
    path: '/resident/settings',
    name: 'resident-settings',
    component: SettingsPage,
  },
  {
    path: '/resident/help',
    name: 'resident-help',
    component: HelpPage,
  },
]