import ResidentsListPage from './pages/ResidentsListPage.vue'
import ResidentsDetailPage from './pages/ResidentsDetailPage.vue'
import ResidentsFormPage from './pages/ResidentsFormPage.vue'

export const residentsRoutes = [
  {
    path: '/residents',
    component: ResidentsListPage,
  },
  {
    path: '/residents/new',
    component: ResidentsFormPage,
  },
  {
    path: '/residents/:id',
    component: ResidentsDetailPage,
  },
  {
    path: '/residents/:id/edit',
    component: ResidentsFormPage,
  },
]