<template>
  <Transition name="modal">
    <div
      v-if="show"
      class="fixed inset-0 z-[60] flex items-center justify-center p-4"
    >
      <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" @click="$emit('cancel')"></div>
      <div class="relative bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-sm p-6">
        <div class="flex flex-col items-center text-center gap-3">
          <div class="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
            <span class="material-symbols-outlined text-red-500 text-2xl">delete_forever</span>
          </div>
          <div>
            <h3 class="text-lg font-bold text-cyan-900">{{ title }}</h3>
            <p class="text-sm text-slate-500 mt-1">{{ message }}</p>
          </div>
        </div>
        <div class="flex gap-3 mt-6">
          <button
            @click="$emit('cancel')"
            class="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all text-sm font-medium"
          >
            {{ cancelText }}
          </button>
          <button
            @click="$emit('confirm')"
            :disabled="loading"
            class="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl hover:brightness-90 transition-all font-semibold text-sm disabled:opacity-50 inline-flex items-center justify-center gap-2"
          >
            <span v-if="loading" class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  show: boolean
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  loading?: boolean
}>(), {
  title: 'Confirmar',
  message: 'Tem certeza?',
  confirmText: 'Confirmar',
  cancelText: 'Cancelar',
  loading: false,
})

defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
.modal-enter-active {
  transition: all 0.2s ease-out;
}
.modal-leave-active {
  transition: all 0.15s ease-in;
}
.modal-enter-from {
  opacity: 0;
}
.modal-enter-from > div:last-child {
  transform: scale(0.95);
}
.modal-leave-to {
  opacity: 0;
}
</style>
