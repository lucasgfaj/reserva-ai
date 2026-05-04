import { ref, readonly } from 'vue'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: number
  message: string
  type: ToastType
  duration?: number
}

let toastId = 0

const toasts = ref<Toast[]>([])

export function useToast() {
  const addToast = (message: string, type: ToastType = 'info', duration = 5000) => {
    const id = ++toastId
    const toast: Toast = { id, message, type, duration }
    toasts.value.push(toast)

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }

  const removeToast = (id: number) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const success = (message: string, duration?: number) => 
    addToast(message, 'success', duration)

  const error = (message: string, duration?: number) => 
    addToast(message, 'error', duration)

  const warning = (message: string, duration?: number) => 
    addToast(message, 'warning', duration)

  const info = (message: string, duration?: number) => 
    addToast(message, 'info', duration)

  return {
    toasts: readonly(toasts),
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  }
}