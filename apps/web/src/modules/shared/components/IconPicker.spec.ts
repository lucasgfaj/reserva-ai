import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import IconPicker from './IconPicker.vue'

describe('IconPicker', () => {
  it('should render all icons', () => {
    const wrapper = mount(IconPicker, { props: { modelValue: '' } })
    const buttons = wrapper.findAll('button')
    expect(buttons.length).toBeGreaterThanOrEqual(30)
  })

  it('should highlight selected icon', () => {
    const wrapper = mount(IconPicker, { props: { modelValue: 'pool' } })
    const selected = wrapper.find('button.bg-primary')
    expect(selected.exists()).toBe(true)
    expect(selected.text()).toContain('pool')
  })

  it('should emit update:modelValue on click', async () => {
    const wrapper = mount(IconPicker, { props: { modelValue: '' } })
    const buttons = wrapper.findAll('button')
    await buttons[0]!.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
  })

  it('should show selected icon name', () => {
    const wrapper = mount(IconPicker, { props: { modelValue: 'pool' } })
    expect(wrapper.text()).toContain('pool')
  })

  it('should not show selected text when no icon selected', () => {
    const wrapper = mount(IconPicker, { props: { modelValue: '' } })
    expect(wrapper.text()).not.toContain('Selecionado')
  })
})
