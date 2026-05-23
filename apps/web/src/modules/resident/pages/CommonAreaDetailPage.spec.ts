import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'

const mockPush = vi.fn()
const mockAfterEach = vi.fn()

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual!,
    useRouter: () => ({ push: mockPush, afterEach: mockAfterEach, beforeEach: vi.fn() }),
    useRoute: () => ({ params: { id: '1' } }),
  }
})

vi.mock('@/modules/auth/services/auth.service', () => ({
  authService: {
    getUser: vi.fn(() => ({ name: 'Morador', role: 'RESIDENT' })),
    logout: vi.fn(),
  },
}))

const mockArea = {
  id: '1',
  name: 'Salão de Festas',
  description: 'Espaço amplo e climatizado para confraternizações.',
  capacity: 80,
  openTime: '08:00',
  closeTime: '23:00',
  operatingDays: '1,2,3,4,5,6,7',
  requiresApproval: true,
  icon: 'celebration',
  isUnderMaintenance: false,
  condominiumId: 'c1',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

import { http } from '@/api/http'

vi.mock('@/api/http', () => ({
  http: {
    get: vi.fn(),
  },
}))

import CommonAreaDetailPage from './CommonAreaDetailPage.vue'

function createWrapper() {
  return mount(CommonAreaDetailPage, {
    global: {
      stubs: {
        SideNavBar: true,
        TopAppBar: true,
        RouterLink: RouterLinkStub,
      },
    },
  })
}

describe('CommonAreaDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(http.get).mockResolvedValue({
      data: { data: mockArea },
    })
  })

  it('should fetch area on mount', async () => {
    const wrapper = createWrapper()
    await new Promise(resolve => setTimeout(resolve, 0))
    await wrapper.vm.$nextTick()

    expect(http.get).toHaveBeenCalledWith('/common-areas/1')
  })

  it('should render area name in header', async () => {
    const wrapper = createWrapper()
    await new Promise(resolve => setTimeout(resolve, 0))
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Salão de Festas')
  })

  it('should render area description', async () => {
    const wrapper = createWrapper()
    await new Promise(resolve => setTimeout(resolve, 0))
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Espaço amplo e climatizado')
  })

  it('should render schedule info', async () => {
    const wrapper = createWrapper()
    await new Promise(resolve => setTimeout(resolve, 0))
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('08:00')
    expect(wrapper.text()).toContain('23:00')
  })

  it('should render capacity info', async () => {
    const wrapper = createWrapper()
    await new Promise(resolve => setTimeout(resolve, 0))
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('80 pessoas')
  })

  it('should render approval requirement', async () => {
    const wrapper = createWrapper()
    await new Promise(resolve => setTimeout(resolve, 0))
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Requer aprovação do administrador')
  })

  it('should show maintenance warning when area is under maintenance', async () => {
    vi.mocked(http.get).mockResolvedValue({
      data: { data: { ...mockArea, isUnderMaintenance: true } },
    })
    const wrapper = createWrapper()
    await new Promise(resolve => setTimeout(resolve, 0))
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Em manutenção')
    expect(wrapper.text()).toContain('temporariamente indisponível')
  })

  it('should not show maintenance warning when area is not under maintenance', async () => {
    const wrapper = createWrapper()
    await new Promise(resolve => setTimeout(resolve, 0))
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).not.toContain('Área temporariamente indisponível')
  })

  it('should render breadcrumb with area name', async () => {
    const wrapper = createWrapper()
    await new Promise(resolve => setTimeout(resolve, 0))
    await wrapper.vm.$nextTick()

    const breadcrumbLinks = wrapper.findAllComponents(RouterLinkStub)
    const commonAreasLink = breadcrumbLinks.find(l => l.text().includes('Áreas Comuns'))
    expect(commonAreasLink).toBeDefined()
  })

  it('should render back button', async () => {
    const wrapper = createWrapper()
    await new Promise(resolve => setTimeout(resolve, 0))
    await wrapper.vm.$nextTick()

    const backButton = wrapper.find('button')
    expect(backButton.exists()).toBe(true)
    expect(backButton.text()).toContain('Voltar')
  })
})
