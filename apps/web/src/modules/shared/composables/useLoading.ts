import { ref } from 'vue'

const pendingRequests = ref(0)
const isLoading = ref(false)

export function useLoading() {
  function start() {
    pendingRequests.value++
    isLoading.value = true
  }

  function finish() {
    pendingRequests.value = Math.max(0, pendingRequests.value - 1)
    if (pendingRequests.value === 0) {
      isLoading.value = false
    }
  }

  return { isLoading, start, finish }
}
