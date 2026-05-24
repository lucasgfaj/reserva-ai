import { describe, it, expect, beforeEach } from 'vitest'
import { useApiError } from './useApiError'
import { useToast } from './useToast'

describe('useApiError', () => {
  let apiError: ReturnType<typeof useApiError>

  beforeEach(() => {
    apiError = useApiError()
  })

  it('should return unknown error message for null', () => {
    expect(apiError.getErrorMessage(null)).toBe('Erro desconhecido')
  })

  it('should return unknown error message for undefined', () => {
    expect(apiError.getErrorMessage(undefined)).toBe('Erro desconhecido')
  })

  it('should return string error directly', () => {
    expect(apiError.getErrorMessage('Algo deu errado')).toBe('Algo deu errado')
  })

  it('should extract message from axios response data', () => {
    const err = { response: { data: { message: 'Email já cadastrado' } } }
    expect(apiError.getErrorMessage(err)).toBe('Email já cadastrado')
  })

  it('should extract error field from axios response data', () => {
    const err = { response: { data: { error: 'Bad Request' } } }
    expect(apiError.getErrorMessage(err)).toBe('Bad Request')
  })

  it('should return axios error message as fallback', () => {
    const err = { message: 'Network Error', response: undefined }
    expect(apiError.getErrorMessage(err)).toBe('Network Error')
  })

  it('should return status-based message for 400', () => {
    const err = { response: { status: 400, data: {} } }
    expect(apiError.getErrorMessage(err)).toBe('Dados inválidos. Verifique os campos.')
  })

  it('should return status-based message for 401', () => {
    const err = { response: { status: 401, data: {} } }
    expect(apiError.getErrorMessage(err)).toBe('Sessão expirada. Faça login novamente.')
  })

  it('should return status-based message for 403', () => {
    const err = { response: { status: 403, data: {} } }
    expect(apiError.getErrorMessage(err)).toBe('Acesso negado. Você não tem permissão.')
  })

  it('should return status-based message for 404', () => {
    const err = { response: { status: 404, data: {} } }
    expect(apiError.getErrorMessage(err)).toBe('Recurso não encontrado.')
  })

  it('should return status-based message for 409', () => {
    const err = { response: { status: 409, data: {} } }
    expect(apiError.getErrorMessage(err)).toBe('Conflito: Este e-mail já está cadastrado.')
  })

  it('should return status-based message for 500', () => {
    const err = { response: { status: 500, data: {} } }
    expect(apiError.getErrorMessage(err)).toBe('Erro no servidor. Tente novamente mais tarde.')
  })

  it('should return default message for unknown status', () => {
    const err = { response: { status: 503, data: {} } }
    expect(apiError.getErrorMessage(err)).toBe('Erro ao processar requisição.')
  })
})