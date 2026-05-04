<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full p-4 pointer-events-none">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="[
            'flex items-start gap-3 p-4 rounded-xl shadow-lg pointer-events-auto',
            'animate-slide-in',
            getToastClass(toast.type)
          ]"
        >
          <span class="material-symbols-outlined flex-shrink-0 text-xl">{{ getIcon(toast.type) }}</span>
          <p class="text-sm font-medium flex-1">{{ toast.message }}</p>
          <button
            @click="removeToast(toast.id)"
            class="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
          >
            <span class="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useToast, type ToastType } from '../../shared/composables/useToast'

const { toasts, removeToast } = useToast()

const getToastClass = (type: ToastType) => {
  switch (type) {
    case 'success':
      return 'bg-tertiary-container text-on-tertiary-fixed border border-tertiary/20'
    case 'error':
      return 'bg-error-container text-on-error-container border border-error/20'
    case 'warning':
      return 'bg-secondary-container text-on-secondary-container border border-secondary/20'
    default:
      return 'bg-surface-container text-on-surface-container border border-slate-200'
  }
}

const getIcon = (type: ToastType) => {
  switch (type) {
    case 'success':
      return 'check_circle'
    case 'error':
      return 'error'
    case 'warning':
      return 'warning'
    default:
      return 'info'
  }
}
</script>

<style scoped>
.toast-enter-active {
  animation: slideIn 0.3s ease-out;
}

.toast-leave-active {
  animation: slideOut 0.3s ease-in;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}
</style>