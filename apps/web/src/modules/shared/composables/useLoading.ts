import { ref } from 'vue'

const isLoading = ref(false)
let pendingCount = 0

export function useLoading() {
  function start() {
    pendingCount++
    isLoading.value = true
  }

  function finish() {
    pendingCount = Math.max(0, pendingCount - 1)
    if (pendingCount === 0) {
      isLoading.value = false
    }
  }

  return { isLoading, start, finish }
}
