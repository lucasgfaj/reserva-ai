<template>
  <div>
    <label class="block text-sm font-medium text-slate-700 mb-3">Ícone</label>
    <div class="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
      <button
        v-for="icon in icons"
        :key="icon"
        type="button"
        @click="select(icon)"
        :class="['w-10 h-10 rounded-xl flex items-center justify-center border transition-all', icon === modelValue ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:border-primary/50 hover:text-primary']"
        :title="icon"
      >
        <span class="material-symbols-outlined text-xl">{{ icon }}</span>
      </button>
    </div>
    <p v-if="modelValue" class="text-xs text-slate-400 mt-2">Selecionado: <strong>{{ modelValue }}</strong></p>
  </div>
</template>

<script setup lang="ts">
defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const select = (icon: string) => emit('update:modelValue', icon)

const icons = [
  'pool',
  'outdoor_grill',
  'celebration',
  'sports_tennis',
  'fitness_center',
  'sports_esports',
  'local_library',
  'park',
  'kitchen',
  'toys',
  'home_work',
  'apartment',
  'deck',
  'yard',
  'hot_tub',
  'sauna',
  'music_note',
  'theater_comedy',
  'restaurant',
  'coffee',
  'sports_soccer',
  'sports_basketball',
  'sports_volleyball',
  'nature',
  'meeting_room',
  'chair',
  'table_restaurant',
  'chess',
  'videogame_asset',
  'menu_book',
  'self_improvement',
  'child_care',
  'pets',
  'forest',
]
</script>
