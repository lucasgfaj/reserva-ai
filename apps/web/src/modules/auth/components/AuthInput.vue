<template>
  <div class="space-y-1.5 w-full">
    <label 
      v-if="label" 
      :for="id" 
      class="text-xs font-semibold uppercase tracking-wider text-on-surface-variant ml-1 flex items-center gap-2"
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
        class="soft-input"
        :placeholder="placeholder"
        :required="required"
        v-bind="$attrs"
      />
      <slot name="right-icon"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  id: string
  label?: string
  icon?: string
  type?: string
  placeholder?: string
  modelValue: string | number
  required?: boolean
}>()

defineEmits(['update:modelValue'])
</script>
