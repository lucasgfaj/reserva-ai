import type { AxiosError } from 'axios'
import { useToast } from './useToast'

interface ApiErrorResponse {
  message?: string
  error?: string
  statusCode?: number
}

export function useApiError() {
  const { error: showError, success: showSuccess } = useToast()

  const getErrorMessage = (err: unknown): string => {
    if (!err) return 'Erro desconhecido'
    
    if (typeof err === 'string') return err

    if (err && typeof err === 'object') {
      const axiosErr = err as AxiosError<ApiErrorResponse>
      
      if (axiosErr.response?.data?.message) {
        return axiosErr.response.data.message
      }
      
      if (axiosErr.response?.data?.error) {
        return axiosErr.response.data.error
      }

      if (axiosErr.message) {
        return axiosErr.message
      }

      switch (axiosErr.response?.status) {
        case 400:
          return 'Dados inválidos. Verifique os campos.'
        case 401:
          return 'Sessão expirada. Faça login novamente.'
        case 403:
          return 'Acesso negado. Você não tem permissão.'
        case 404:
          return 'Recurso não encontrado.'
        case 409:
          return 'Conflito: Este e-mail já está cadastrado.'
        case 422:
          return 'Dados incorretos. Verifique o formato.'
        case 500:
          return 'Erro no servidor. Tente novamente mais tarde.'
        default:
          return 'Erro ao processar requisição.'
      }
    }

    return 'Erro desconhecido'
  }

  const handleError = (err: unknown, fallbackMessage = 'Erro ao processar requisição') => {
    const message = getErrorMessage(err)
    showError(message)
    console.error('API Error:', err)
    return message
  }

  const handleSuccess = (message: string) => {
    showSuccess(message)
  }

  return {
    getErrorMessage,
    handleError,
    handleSuccess,
  }
}