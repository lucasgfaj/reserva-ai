<template>
  <div v-if="totalPages > 1" class="flex items-center justify-center gap-1 pt-4">
    <button
      @click="goTo(current - 1)"
      :disabled="current <= 1"
      class="p-2 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-slate-500"
    >
      <span class="material-symbols-outlined text-[18px]">chevron_left</span>
    </button>

    <button
      v-for="p in visiblePages"
      :key="p"
      @click="goTo(p)"
      :class="['min-w-[36px] h-9 rounded-lg text-sm font-medium transition-all', p === current ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100']"
    >
      {{ p }}
    </button>

    <button
      @click="goTo(current + 1)"
      :disabled="current >= totalPages"
      class="p-2 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-slate-500"
    >
      <span class="material-symbols-outlined text-[18px]">chevron_right</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  current: number
  totalPages: number
}>()

const emit = defineEmits<{
  page: [page: number]
}>()

const VISIBLE_PAGES = 5

const visiblePages = computed(() => {
  const half = Math.floor(VISIBLE_PAGES / 2)
  let start = Math.max(1, props.current - half)
  let end = Math.min(props.totalPages, start + VISIBLE_PAGES - 1)

  if (end - start + 1 < VISIBLE_PAGES) {
    start = Math.max(1, end - VISIBLE_PAGES + 1)
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

function goTo(page: number) {
  if (page < 1 || page > props.totalPages || page === props.current) return
  emit('page', page)
}
</script>
