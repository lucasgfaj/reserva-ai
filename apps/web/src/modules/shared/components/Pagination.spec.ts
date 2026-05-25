import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Pagination from './Pagination.vue'

describe('Pagination', () => {
  it('should not render when totalPages <= 1', () => {
    const wrapper = mount(Pagination, { props: { current: 1, totalPages: 1 } })
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('should render page buttons when totalPages > 1', () => {
    const wrapper = mount(Pagination, { props: { current: 1, totalPages: 3 } })
    const buttons = wrapper.findAll('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('should disable prev button on first page', () => {
    const wrapper = mount(Pagination, { props: { current: 1, totalPages: 5 } })
    const prevButton = wrapper.findAll('button')[0]!
    expect(prevButton.attributes('disabled')).toBeDefined()
  })

  it('should disable next button on last page', () => {
    const wrapper = mount(Pagination, { props: { current: 5, totalPages: 5 } })
    const buttons = wrapper.findAll('button')
    const nextButton = buttons[buttons.length - 1]!
    expect(nextButton.attributes('disabled')).toBeDefined()
  })

  it('should emit page event when clicking a page number', async () => {
    const wrapper = mount(Pagination, { props: { current: 1, totalPages: 5 } })
    const pageButtons = wrapper.findAll('button')
    const page2 = pageButtons.find(b => b.text() === '2')
    await page2?.trigger('click')
    expect(wrapper.emitted('page')?.[0]).toEqual([2])
  })

  it('should emit page event on next button click', async () => {
    const wrapper = mount(Pagination, { props: { current: 1, totalPages: 5 } })
    const buttons = wrapper.findAll('button')
    const nextButton = buttons[buttons.length - 1]!
    await nextButton.trigger('click')
    expect(wrapper.emitted('page')?.[0]).toEqual([2])
  })

  it('should emit page event on prev button click', async () => {
    const wrapper = mount(Pagination, { props: { current: 3, totalPages: 5 } })
    const buttons = wrapper.findAll('button')
    const prevButton = buttons[0]!
    await prevButton.trigger('click')
    expect(wrapper.emitted('page')?.[0]).toEqual([2])
  })

  it('should highlight current page', () => {
    const wrapper = mount(Pagination, { props: { current: 3, totalPages: 5 } })
    const activeButton = wrapper.find('.bg-primary')
    expect(activeButton.exists()).toBe(true)
    expect(activeButton.text()).toBe('3')
  })
})
