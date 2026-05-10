import ResidentDashboard from './pages/ResidentDashboard.vue'
import CommonAreasListPage from './pages/CommonAreasListPage.vue'
import MyReservationsPage from './pages/MyReservationsPage.vue'

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
    path: '/resident/reservations',
    name: 'resident-reservations',
    component: MyReservationsPage,
  },
]