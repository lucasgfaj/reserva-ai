<template>
  <router-view />
  <ToastContainer />
  <LoadingBar />
</template>

<script setup lang="ts">
import ToastContainer from '@/modules/shared/components/ToastContainer.vue'
import LoadingBar from '@/modules/shared/components/LoadingBar.vue'
</script>