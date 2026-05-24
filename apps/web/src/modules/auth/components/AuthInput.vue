<template>
  <div class="space-y-1.5 w-full">
    <label 
      v-if="label" 
      :for="id" 
      class="text-xs font-semibold uppercase tracking-wider ml-1 flex items-center gap-2"
      :class="error ? 'text-error' : 'text-on-surface-variant'"
    >
      {{ label }}
      <span v-if="icon" class="material-symbols-outlined text-[14px]">{{ icon }}</span>
    </label>
    <div class="relative">
      <input 
        :id="id"
        :type="type"
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @blur="$emit('blur')"
        class="soft-input"
        :class="error ? 'error-input' : ''"
        :placeholder="placeholder"
        :required="required"
        v-bind="$attrs"
      />
      <slot name="right-icon"></slot>
    </div>
    <p v-if="error" class="text-xs text-error ml-1 flex items-center gap-1">
      <span class="material-symbols-outlined text-sm">error</span>
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { readonly } from 'vue'

defineProps<{
  id: string
  label?: string
  icon?: string
  type?: string
  placeholder?: string
  modelValue: string | number
  required?: boolean
  error?: string
}>()

defineEmits(['update:modelValue', 'blur'])
</script>

<style scoped>
.soft-input {
  @apply w-full px-4 py-3 bg-surface-container-low border border-transparent rounded-xl text-sm;
  @apply focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary;
  @apply placeholder:text-on-surface-variant/50 transition-all;
}

.error-input {
  @apply border-error focus:ring-error/20 focus:border-error;
}
</style>