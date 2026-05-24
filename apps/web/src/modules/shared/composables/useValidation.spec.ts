import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useValidation } from './useValidation'

describe('useValidation', () => {
  let validation: ReturnType<typeof useValidation>

  beforeEach(() => {
    validation = useValidation()
  })

  it('should validate required fields', () => {
    const rules = { name: { required: true } }
    const isValid = validation.validate({ name: '' }, rules)
    expect(isValid).toBe(false)
    expect(validation.getError('name')).toBe('Este campo é obrigatório')
  })

  it('should pass for non-empty required field', () => {
    const rules = { name: { required: true } }
    const isValid = validation.validate({ name: 'João' }, rules)
    expect(isValid).toBe(true)
    expect(validation.hasError('name')).toBe(false)
  })

  it('should validate email format', () => {
    const rules = { email: { email: true } }
    expect(validation.validate({ email: 'invalido' }, rules)).toBe(false)
    expect(validation.getError('email')).toBe('E-mail inválido')
  })

  it('should pass for valid email', () => {
    const rules = { email: { email: true } }
    expect(validation.validate({ email: 'joao@test.com' }, rules)).toBe(true)
  })

  it('should validate minLength', () => {
    const rules = { name: { minLength: 3 } }
    expect(validation.validate({ name: 'Jo' }, rules)).toBe(false)
    expect(validation.getError('name')).toBe('Mínimo de 3 caracteres')
  })

  it('should validate maxLength', () => {
    const rules = { name: { maxLength: 5 } }
    expect(validation.validate({ name: 'LongName' }, rules)).toBe(false)
    expect(validation.getError('name')).toBe('Máximo de 5 caracteres')
  })

  it('should validate password with letter and number', () => {
    const rules = { password: { password: true } }
    expect(validation.validate({ password: '12345678' }, rules)).toBe(false)
    expect(validation.getError('password')).toBe('A senha deve conter letra e número')
  })

  it('should validate password minLength 8', () => {
    const rules = { password: { password: true } }
    expect(validation.validate({ password: 'Abc123' }, rules)).toBe(false)
    expect(validation.getError('password')).toBe('Mínimo de 8 caracteres')
  })

  it('should accept valid password', () => {
    const rules = { password: { password: true } }
    expect(validation.validate({ password: 'Senha1234' }, rules)).toBe(true)
  })

  it('should skip password validation when empty', () => {
    const rules = { password: { password: true } }
    expect(validation.validate({ password: '' }, rules)).toBe(true)
  })

  it('should support custom validator', () => {
    const rules = {
      unit: { custom: (v: string) => v.startsWith('AP') || 'Deve começar com AP' },
    }
    expect(validation.validate({ unit: 'Casa 1' }, rules)).toBe(false)
    expect(validation.getError('unit')).toBe('Deve começar com AP')
  })

  it('should pass custom validator', () => {
    const rules = {
      unit: { custom: (v: string) => v.startsWith('AP') || 'Inválido' },
    }
    expect(validation.validate({ unit: 'AP 101' }, rules)).toBe(true)
  })

  it('should collect multiple errors', () => {
    const rules = {
      name: { required: true },
      email: { email: true },
    }
    const isValid = validation.validate({ name: '', email: 'invalido' }, rules)
    expect(isValid).toBe(false)
    expect(validation.hasError('name')).toBe(true)
    expect(validation.hasError('email')).toBe(true)
  })

  it('should clear all errors', () => {
    validation.validate({ name: '' }, { name: { required: true } })
    expect(validation.hasError('name')).toBe(true)
    validation.clearErrors()
    expect(validation.hasError('name')).toBe(false)
  })

  it('should clear single field error', () => {
    validation.validate({ name: '', email: 'invalido' }, {
      name: { required: true },
      email: { email: true },
    })
    validation.clearFieldError('name')
    expect(validation.hasError('name')).toBe(false)
    expect(validation.hasError('email')).toBe(true)
  })
})