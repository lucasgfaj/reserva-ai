import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { h } from 'vue'
import SideNavBar from './SideNavBar.vue'

vi.mock('@/modules/auth/services/auth.service', () => ({
  authService: {
    getUser: vi.fn(() => ({ name: 'Admin', role: 'ADMIN', email: 'admin@test.com' })),
    getCondo: vi.fn(() => ({ id: '1', name: 'Condomínio Vila Verde' })),
    logout: vi.fn(),
  },
}))

const routes = [
  { path: '/condominium/dashboard', name: 'admin-dashboard', component: { template: '<div>Dashboard</div>' } },
  { path: '/condominium/residents', name: 'admin-residents', component: { template: '<div>Residents</div>' } },
  { path: '/condominium/common-areas', name: 'admin-common-areas', component: { template: '<div>Common Areas</div>' } },
  { path: '/resident/dashboard', name: 'resident-dashboard', component: { template: '<div>Dashboard</div>' } },
  { path: '/resident/reservations', name: 'resident-reservations', component: { template: '<div>Reservations</div>' } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

describe('SideNavBar', () => {
  beforeEach(async () => {
    router.push('/condominium/dashboard')
    await router.isReady()
  })

  it('should render admin menu items', () => {
    const wrapper = mount(SideNavBar, {
      props: { role: 'ADMIN' },
      global: { plugins: [router] },
    })

    const links = wrapper.findAll('nav a')
    expect(links.length).toBe(6)
    expect(links.at(0)?.text()).toContain('Início')
    expect(links.at(1)?.text()).toContain('Condomínio')
    expect(links.at(2)?.text()).toContain('Moradores')
    expect(links.at(3)?.text()).toContain('Áreas Comuns')
    expect(links.at(4)?.text()).toContain('Reservas')
    expect(links.at(5)?.text()).toContain('Relatórios')
  })

  it('should render resident menu items', () => {
    const wrapper = mount(SideNavBar, {
      props: { role: 'RESIDENT' },
      global: { plugins: [router] },
    })

    const links = wrapper.findAll('nav a')
    expect(links.length).toBe(5)
    expect(links.at(0)?.text()).toContain('Início')
    expect(links.at(1)?.text()).toContain('Áreas Comuns')
    expect(links.at(2)?.text()).toContain('Disponibilidade')
    expect(links.at(3)?.text()).toContain('Nova Reserva')
    expect(links.at(4)?.text()).toContain('Minhas Reservas')
  })

  it('should render super admin menu items', () => {
    const wrapper = mount(SideNavBar, {
      props: { role: 'SUPER_ADMIN' },
      global: { plugins: [router] },
    })

    const links = wrapper.findAll('nav a')
    expect(links.length).toBe(2)
    expect(links.at(0)?.text()).toContain('Dashboard')
    expect(links.at(1)?.text()).toContain('Condomínios')
  })

  it('should apply active class to current route', async () => {
    await router.push('/condominium/residents')
    await router.isReady()

    const wrapper = mount(SideNavBar, {
      props: { role: 'ADMIN' },
      global: { plugins: [router] },
    })

    const activeLink = wrapper.find('nav a.font-bold')
    expect(activeLink.exists()).toBe(true)
    expect(activeLink.text()).toContain('Moradores')
  })

  it('should show role subtitle when expanded', () => {
    const wrapper = mount(SideNavBar, {
      props: { role: 'ADMIN', collapsed: false },
      global: { plugins: [router] },
    })

    expect(wrapper.text()).toContain('Administração')
  })

  it('should show resident role subtitle when expanded', () => {
    const wrapper = mount(SideNavBar, {
      props: { role: 'RESIDENT', collapsed: false },
      global: { plugins: [router] },
    })

    expect(wrapper.text()).toContain('Morador')
  })

  it('should hide labels when collapsed', () => {
    const wrapper = mount(SideNavBar, {
      props: { role: 'ADMIN', collapsed: true },
      global: { plugins: [router] },
    })

    // Labels should be hidden (v-show=false renders but display:none)
    const navLinks = wrapper.findAll('nav a span:last-child')
    navLinks.forEach(span => {
      expect(span.attributes('style')).toContain('display: none')
    })
  })

  it('should display condominium name without prefix when expanded', () => {
    const wrapper = mount(SideNavBar, {
      props: { role: 'ADMIN', collapsed: false },
      global: { plugins: [router] },
    })

    const brandTitle = wrapper.find('h1')
    expect(brandTitle.text()).toBe('Vila Verde')
  })

  it('should have w-16 class when collapsed', () => {
    const wrapper = mount(SideNavBar, {
      props: { role: 'ADMIN', collapsed: true },
      global: { plugins: [router] },
    })

    const aside = wrapper.find('aside')
    expect(aside.classes()).toContain('w-16')
    expect(aside.classes()).not.toContain('w-72')
  })

  it('should have w-72 class when not collapsed', () => {
    const wrapper = mount(SideNavBar, {
      props: { role: 'ADMIN', collapsed: false },
      global: { plugins: [router] },
    })

    const aside = wrapper.find('aside')
    expect(aside.classes()).toContain('w-72')
    expect(aside.classes()).not.toContain('w-16')
  })

  it('should render help link in footer when expanded', () => {
    const wrapper = mount(SideNavBar, {
      props: { role: 'ADMIN', collapsed: false },
      global: { plugins: [router] },
    })

    expect(wrapper.text()).toContain('Ajuda')
  })

  it('should emit logout on sair click', async () => {
    const wrapper = mount(SideNavBar, {
      props: { role: 'ADMIN' },
      global: { plugins: [router] },
    })

    const logoutLink = wrapper.findAll('a').filter(a => a.text().includes('Sair'))
    expect(logoutLink.length).toBeGreaterThan(0)
    await logoutLink[0].trigger('click')
    expect(wrapper.emitted('logout')).toBeTruthy()
    expect(wrapper.emitted('logout')?.length).toBe(1)
  })

  it('should emit cta-click on CTA button click', async () => {
    const wrapper = mount(SideNavBar, {
      props: { role: 'ADMIN' },
      global: { plugins: [router] },
    })

    // CTA is the first signature-gradient button
    const ctaButton = wrapper.find('button.signature-gradient')
    expect(ctaButton.exists()).toBe(true)
    expect(ctaButton.text()).toContain('Novo Comunicado')
    await ctaButton.trigger('click')
    expect(wrapper.emitted('cta-click')).toBeTruthy()
    expect(wrapper.emitted('cta-click')?.[0]).toEqual(['admin-cta'])
  })

  it('should emit link-click on nav link click', async () => {
    const wrapper = mount(SideNavBar, {
      props: { role: 'ADMIN' },
      global: { plugins: [router] },
    })

    const firstLink = wrapper.find('nav a')
    await firstLink.trigger('click')
    expect(wrapper.emitted('link-click')).toBeTruthy()
  })

  it('should emit toggle-collapse on collapse button click', async () => {
    const wrapper = mount(SideNavBar, {
      props: { role: 'ADMIN' },
      global: { plugins: [router] },
    })

    const collapseButton = wrapper.findAll('button').filter(b => b.text().includes('Recolher') || b.find('.material-symbols-outlined'))
    // The collapse toggle is the last button (not signature-gradient)
    const btn = wrapper.findAll('button').filter(b => !b.classes().includes('signature-gradient'))
    expect(btn.length).toBe(1)
    await btn[0].trigger('click')
    expect(wrapper.emitted('toggle-collapse')).toBeTruthy()
    expect(wrapper.emitted('toggle-collapse')?.length).toBe(1)
  })
})