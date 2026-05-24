import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'

const mockPush = vi.fn()
const mockAfterEach = vi.fn()
let mockRouteVal: { params: Record<string, string>; path: string } = { params: {}, path: '/condominium/residents/new' }

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

vi.mock('@/modules/shared/composables/useValidation', () => ({
  useValidation: vi.fn(() => ({
    validate: vi.fn(() => true),
    hasError: vi.fn(() => false),
    getError: vi.fn(() => ''),
    clearErrors: vi.fn(),
    clearFieldError: vi.fn(),
    errors: { value: {} },
  })),
}))

const mockResident = {
  id: '1',
  name: 'João Silva',
  email: 'joao@test.com',
  unit: 'AP 101',
  phone: '11999999999',
  canBook: true,
  role: 'RESIDENT',
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
}

import { residentsService } from '@/modules/residents/services/residents.service'

vi.mock('@/modules/residents/services/residents.service', () => ({
  residentsService: {
    getById: vi.fn(),
    create: vi.fn(),
    updatePermissions: vi.fn(),
  },
}))

import ResidentsFormPage from './ResidentsFormPage.vue'

function createWrapper() {
  return mount(ResidentsFormPage, {
    global: {
      stubs: {
        SideNavBar: true,
        TopAppBar: true,
        RouterLink: RouterLinkStub,
      },
    },
  })
}

describe('ResidentsFormPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRouteVal = { params: {}, path: '/condominium/residents/new' }
  })

  it('should render create mode title', () => {
    const wrapper = createWrapper()

    expect(wrapper.text()).toContain('Cadastrar Novo Morador')
    expect(wrapper.text()).not.toContain('Editar Morador')
  })

  it('should render form fields in create mode', () => {
    const wrapper = createWrapper()

    expect(wrapper.text()).toContain('Nome completo')
    expect(wrapper.text()).toContain('E-mail')
    expect(wrapper.text()).toContain('Unidade')
    expect(wrapper.text()).toContain('Telefone')
    expect(wrapper.text()).toContain('Senha')
    expect(wrapper.text()).toContain('Permissão de Reserva')
  })

  it('should show breadcrumb navigation in create mode', () => {
    const wrapper = createWrapper()

    const routerLinks = wrapper.findAllComponents(RouterLinkStub)
    const moradoresLink = routerLinks.filter(l => l.text().includes('Moradores'))
    expect(moradoresLink.length).toBe(1)
  })

  it('should render SideNavBar with ADMIN role', () => {
    const wrapper = createWrapper()

    const sidebar = wrapper.findComponent({ name: 'SideNavBar' })
    expect(sidebar.exists()).toBe(true)
  })

  it('should render TopAppBar', () => {
    const wrapper = createWrapper()

    const topbar = wrapper.findComponent({ name: 'TopAppBar' })
    expect(topbar.exists()).toBe(true)
  })

  it('should have save and cancel buttons', () => {
    const wrapper = createWrapper()

    expect(wrapper.text()).toContain('Salvar')
    expect(wrapper.text()).toContain('Cancelar')
  })

  it('should call create on submit in create mode', async () => {
    vi.mocked(residentsService.create).mockResolvedValue({
      message: 'Morador criado com sucesso',
      user: { id: '2', name: 'Novo', email: 'novo@test.com', role: 'RESIDENT' },
    })

    const wrapper = createWrapper()
    await wrapper.vm.$nextTick()

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    await wrapper.vm.$nextTick()

    expect(residentsService.create).toHaveBeenCalledWith({
      name: '',
      email: '',
      unit: undefined,
      phone: undefined,
      canBook: true,
      password: undefined,
    })
  })

  it('should not show password field in edit mode', () => {
    mockRouteVal = { params: { id: '1' }, path: '/condominium/residents/1/edit' }
    const wrapper = createWrapper()

    expect(wrapper.text()).not.toContain('Senha')
  })
})