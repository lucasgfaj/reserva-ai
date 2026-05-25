import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'

const mockPush = vi.fn()
const mockAfterEach = vi.fn()
let mockRouteVal = { params: {}, path: '/condominium/residents' }

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual!,
    useRouter: () => ({ push: mockPush, afterEach: mockAfterEach, beforeEach: vi.fn() }),
    useRoute: () => mockRouteVal,
  }
})

vi.mock('@/modules/auth/services/auth.service', () => ({
  authService: {
    getUser: vi.fn(() => ({ name: 'Admin', role: 'ADMIN', email: 'admin@test.com' })),
    logout: vi.fn(),
  },
}))

vi.mock('@/modules/shared/composables/useToast', () => ({
  useToast: vi.fn(() => ({
    success: vi.fn(),
    error: vi.fn(),
  })),
}))

vi.mock('@/modules/shared/composables/useApiError', () => ({
  useApiError: vi.fn(() => ({
    handleError: vi.fn(),
  })),
}))

const mockResidents: import('@/modules/residents/services/residents.service').Resident[] = [
  { id: '1', name: 'João Silva', email: 'joao@test.com', role: 'RESIDENT', isActive: true, createdAt: '2024-01-01', unit: 'AP 101', phone: '11999999999', canBook: true },
  { id: '2', name: 'Maria Santos', email: 'maria@test.com', role: 'RESIDENT', isActive: true, createdAt: '2024-01-01', unit: 'AP 102', phone: '11988888888', canBook: false },
  { id: '3', name: 'Carlos Souza', email: 'carlos@test.com', role: 'RESIDENT', isActive: true, createdAt: '2024-01-01', unit: 'AP 103', canBook: true },
]

import { residentsService } from '@/modules/residents/services/residents.service'

vi.mock('@/modules/residents/services/residents.service', () => ({
  residentsService: {
    getAll: vi.fn(),
    updatePermissions: vi.fn(),
  },
}))

import ResidentsListPage from './ResidentsListPage.vue'

function createWrapper() {
  return mount(ResidentsListPage, {
    global: {
      stubs: {
        SideNavBar: true,
        TopAppBar: true,
        RouterLink: RouterLinkStub,
      },
    },
  })
}

describe('ResidentsListPage', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    vi.mocked(residentsService.getAll).mockResolvedValue({
      residents: mockResidents,
      total: mockResidents.length,
      page: 1,
      limit: 10,
      totalPages: 1,
    })
  })

  it('should render page title and description', async () => {
    const wrapper = createWrapper()
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Moradores')
    expect(wrapper.text()).toContain('Gerencie os moradores do condomínio')
  })

  it('should render SideNavBar with ADMIN role', () => {
    const wrapper = createWrapper()
    const sidebar = wrapper.findComponent({ name: 'SideNavBar' })
    expect(sidebar.exists()).toBe(true)
  })

  it('should render TopAppBar with ADMIN role', () => {
    const wrapper = createWrapper()
    const topbar = wrapper.findComponent({ name: 'TopAppBar' })
    expect(topbar.exists()).toBe(true)
  })

  it('should fetch and display residents on mount', async () => {
    const wrapper = createWrapper()
    await new Promise(resolve => setTimeout(resolve, 0))
    await wrapper.vm.$nextTick()

    expect(residentsService.getAll).toHaveBeenCalledOnce()
    expect(wrapper.text()).toContain('João Silva')
    expect(wrapper.text()).toContain('Maria Santos')
    expect(wrapper.text()).toContain('Carlos Souza')
  })

  it('should filter residents by search query', async () => {
    const wrapper = createWrapper()
    await new Promise(resolve => setTimeout(resolve, 0))
    await wrapper.vm.$nextTick()

    const searchInput = wrapper.find('input[placeholder="Buscar moradores..."]')
    await searchInput.setValue('maria')
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Maria Santos')
    expect(wrapper.text()).not.toContain('João Silva')
  })

  it('should have Novo Morador link to new resident page', () => {
    const wrapper = createWrapper()

    const newLinks = wrapper.findAllComponents(RouterLinkStub).filter(
      link => link.props('to') === '/condominium/residents/new'
    )
    expect(newLinks.length).toBe(1)
    expect(newLinks[0]!.text()).toContain('Novo Morador')
  })

  it('should have edit links for each resident', async () => {
    const wrapper = createWrapper()
    await new Promise(resolve => setTimeout(resolve, 0))
    await wrapper.vm.$nextTick()

    const editLinks = wrapper.findAllComponents(RouterLinkStub).filter(
      link => typeof link.props('to') === 'string' && link.props('to').includes('/edit')
    )
    // 3 desktop + 3 mobile
    expect(editLinks.length).toBe(6)
  })

  it('should have detail links for each resident', async () => {
    const wrapper = createWrapper()
    await new Promise(resolve => setTimeout(resolve, 0))
    await wrapper.vm.$nextTick()

    const detailLinks = wrapper.findAllComponents(RouterLinkStub).filter(link => {
      const to = link.props('to')
      return typeof to === 'string' && to.startsWith('/condominium/residents/') && !to.endsWith('/edit') && !to.endsWith('/new')
    })
    // 3 desktop + 3 mobile
    expect(detailLinks.length).toBe(6)
  })

  it('should show canBook toggle buttons', async () => {
    const wrapper = createWrapper()
    await new Promise(resolve => setTimeout(resolve, 0))
    await wrapper.vm.$nextTick()

    const canBookButtons = wrapper.findAll('button').filter(
      b => b.text() === 'Permitido' || b.text() === 'Bloqueado'
    )
    expect(canBookButtons.length).toBe(3)
  })

  it('should show delete confirmation modal on inactivate click', async () => {
    const wrapper = createWrapper()
    await new Promise(resolve => setTimeout(resolve, 0))
    await wrapper.vm.$nextTick()

    const inactivateButtons = wrapper.findAll('button[title="Inativar"]')
    expect(inactivateButtons.length).toBe(3)

    await inactivateButtons[0]!.trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Confirmar Inativação')
  })

  it('should call residentsService.getAll on mount', async () => {
    createWrapper()
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(residentsService.getAll).toHaveBeenCalledTimes(1)
  })
})