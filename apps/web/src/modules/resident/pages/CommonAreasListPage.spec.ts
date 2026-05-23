import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'

const mockPush = vi.fn()
const mockAfterEach = vi.fn()

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual!,
    useRouter: () => ({ push: mockPush, afterEach: mockAfterEach, beforeEach: vi.fn() }),
    useRoute: () => ({ params: {} }),
  }
})

vi.mock('@/modules/auth/services/auth.service', () => ({
  authService: {
    getUser: vi.fn(() => ({ name: 'Morador', role: 'RESIDENT' })),
    logout: vi.fn(),
  },
}))

const mockAreas = [
  { id: '1', name: 'Salão de Festas', description: 'Espaço amplo', capacity: 80, openTime: '08:00', closeTime: '23:00', operatingDays: [1, 2, 3, 4, 5, 6, 7], requiresApproval: true, icon: 'celebration', isUnderMaintenance: false, condominiumId: 'c1', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '2', name: 'Piscina', description: 'Piscina adulto', capacity: 60, openTime: '09:00', closeTime: '21:00', operatingDays: [1, 2, 3, 4, 5, 6, 7], requiresApproval: false, icon: 'pool', isUnderMaintenance: false, condominiumId: 'c1', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '3', name: 'Churrasqueira', description: 'Área gourmet', capacity: 40, openTime: '10:00', closeTime: '22:00', operatingDays: [6, 7], requiresApproval: false, icon: 'outdoor_grill', isUnderMaintenance: true, condominiumId: 'c1', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
]

import { http } from '@/api/http'

vi.mock('@/api/http', () => ({
  http: {
    get: vi.fn(),
  },
}))

import CommonAreasListPage from './CommonAreasListPage.vue'

function createWrapper() {
  return mount(CommonAreasListPage, {
    global: {
      stubs: {
        SideNavBar: true,
        TopAppBar: true,
        RouterLink: RouterLinkStub,
        Pagination: true,
      },
    },
  })
}

describe('CommonAreasListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(http.get).mockResolvedValue({
      data: {
        data: {
          commonAreas: mockAreas,
          total: mockAreas.length,
          page: 1,
          limit: 6,
          totalPages: 1,
        },
      },
    })
  })

  it('should render page title', async () => {
    const wrapper = createWrapper()
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Áreas Comuns')
  })

  it('should fetch areas on mount', async () => {
    const wrapper = createWrapper()
    await new Promise(resolve => setTimeout(resolve, 0))
    await wrapper.vm.$nextTick()

    expect(http.get).toHaveBeenCalledWith('/common-areas', { params: { page: 1, limit: 6 } })
  })

  it('should display area cards', async () => {
    const wrapper = createWrapper()
    await new Promise(resolve => setTimeout(resolve, 0))
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Salão de Festas')
    expect(wrapper.text()).toContain('Piscina')
    expect(wrapper.text()).toContain('Churrasqueira')
  })

  it('should show maintenance badge for areas in maintenance', async () => {
    const wrapper = createWrapper()
    await new Promise(resolve => setTimeout(resolve, 0))
    await wrapper.vm.$nextTick()

    const badges = wrapper.findAll('.bg-amber-50')
    const maintenanceBadges = badges.filter(b => b.text().includes('Em manutenção'))
    expect(maintenanceBadges.length).toBe(1)
  })

  it('should show capacity for areas', async () => {
    const wrapper = createWrapper()
    await new Promise(resolve => setTimeout(resolve, 0))
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('80 pessoas')
    expect(wrapper.text()).toContain('60 pessoas')
  })

  it('should show requires approval badge', async () => {
    const wrapper = createWrapper()
    await new Promise(resolve => setTimeout(resolve, 0))
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Requer aprovação')
  })

  it('should navigate to detail on card click', async () => {
    const wrapper = createWrapper()
    await new Promise(resolve => setTimeout(resolve, 0))
    await wrapper.vm.$nextTick()

    const cards = wrapper.findAll('.cursor-pointer')
    await cards[0].trigger('click')

    expect(mockPush).toHaveBeenCalledWith('/resident/common-areas/1')
  })

  it('should render SideNavBar', () => {
    const wrapper = createWrapper()
    expect(wrapper.findComponent({ name: 'SideNavBar' }).exists()).toBe(true)
  })

  it('should render TopAppBar', () => {
    const wrapper = createWrapper()
    expect(wrapper.findComponent({ name: 'TopAppBar' }).exists()).toBe(true)
  })

  it('should render Pagination component', async () => {
    const wrapper = createWrapper()
    await new Promise(resolve => setTimeout(resolve, 0))
    await wrapper.vm.$nextTick()
    expect(wrapper.findComponent({ name: 'Pagination' }).exists()).toBe(true)
  })

  it('should show loading state while fetching', async () => {
    vi.mocked(http.get).mockImplementation(() => new Promise(() => {}))
    const wrapper = createWrapper()
    await wrapper.vm.$nextTick()
    const skeletons = wrapper.findAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('should show error state on fetch failure', async () => {
    vi.mocked(http.get).mockRejectedValueOnce(new Error('Network error'))
    const wrapper = createWrapper()
    await new Promise(resolve => setTimeout(resolve, 0))
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Erro ao carregar')
  })

  it('should show retry button on error', async () => {
    vi.mocked(http.get).mockRejectedValueOnce(new Error('Network error'))
    const wrapper = createWrapper()
    await new Promise(resolve => setTimeout(resolve, 0))
    await wrapper.vm.$nextTick()

    const retryButton = wrapper.find('button')
    expect(retryButton.exists()).toBe(true)
    expect(retryButton.text()).toContain('Tentar novamente')
  })
})
