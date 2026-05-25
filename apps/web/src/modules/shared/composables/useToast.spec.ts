import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useToast } from './useToast'

describe('useToast', () => {
  let toast: ReturnType<typeof useToast>

  beforeEach(() => {
    vi.useFakeTimers()
    toast = useToast()
    toast.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should add a toast', () => {
    const id = toast.addToast('Test message', 'info')
    expect(id).toBeGreaterThan(0)
    expect(toast.toasts.value).toHaveLength(1)
    expect(toast.toasts.value[0]!.message).toBe('Test message')
    expect(toast.toasts.value[0]!.type).toBe('info')
  })

  it('should add success toast', () => {
    toast.success('Success!')
    expect(toast.toasts.value[0]!.type).toBe('success')
    expect(toast.toasts.value[0]!.message).toBe('Success!')
  })

  it('should add error toast', () => {
    toast.error('Error!')
    expect(toast.toasts.value[0]!.type).toBe('error')
  })

  it('should add warning toast', () => {
    toast.warning('Warning!')
    expect(toast.toasts.value[0]!.type).toBe('warning')
  })

  it('should add info toast', () => {
    toast.info('Info!')
    expect(toast.toasts.value[0]!.type).toBe('info')
  })

  it('should remove toast after duration', () => {
    toast.addToast('Auto remove', 'info', 5000)
    expect(toast.toasts.value).toHaveLength(1)

    vi.advanceTimersByTime(5000)

    expect(toast.toasts.value).toHaveLength(0)
  })

  it('should not auto-remove when duration is 0', () => {
    toast.addToast('Persistent', 'info', 0)
    expect(toast.toasts.value).toHaveLength(1)

    vi.advanceTimersByTime(10000)

    expect(toast.toasts.value).toHaveLength(1)
  })

  it('should remove toast by id', () => {
    const id = toast.addToast('To remove', 'info')
    expect(toast.toasts.value).toHaveLength(1)

    toast.removeToast(id)
    expect(toast.toasts.value).toHaveLength(0)
  })

  it('should allow multiple toasts', () => {
    toast.success('First')
    toast.error('Second')
    toast.warning('Third')
    expect(toast.toasts.value).toHaveLength(3)
  })

  it('should clear all toasts', () => {
    toast.success('First')
    toast.error('Second')
    expect(toast.toasts.value).toHaveLength(2)

    toast.clear()
    expect(toast.toasts.value).toHaveLength(0)
  })
})