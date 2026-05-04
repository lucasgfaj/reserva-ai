import { ref, readonly } from 'vue'

export interface ValidationRule {
  required?: boolean
  email?: boolean
  minLength?: number
  maxLength?: number
  password?: boolean
  custom?: (value: string) => boolean | string
}

export interface ValidationRules {
  [field: string]: ValidationRule
}

export function useValidation() {
  const errors = ref<Record<string, string>>({})

  const validate = (data: Record<string, string>, rules: ValidationRules): boolean => {
    errors.value = {}
    let isValid = true

    for (const field in rules) {
      const value = data[field] || ''
      const fieldRules = rules[field]

      if (!fieldRules) continue

      if (fieldRules.required && !value.trim()) {
        errors.value[field] = 'Este campo é obrigatório'
        isValid = false
        continue
      }

      if (fieldRules.email && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) {
          errors.value[field] = 'E-mail inválido'
          isValid = false
          continue
        }
      }

      if (fieldRules.minLength && value.length < fieldRules.minLength) {
        errors.value[field] = `Mínimo de ${fieldRules.minLength} caracteres`
        isValid = false
        continue
      }

      if (fieldRules.maxLength && value.length > fieldRules.maxLength) {
        errors.value[field] = `Máximo de ${fieldRules.maxLength} caracteres`
        isValid = false
        continue
      }

      if (fieldRules.password && value) {
        const hasLetter = /[a-zA-Z]/.test(value)
        const hasNumber = /[0-9]/.test(value)
        
        if (!hasLetter || !hasNumber) {
          errors.value[field] = 'A senha deve conter letra e número'
          isValid = false
          continue
        }

        if (value.length < 8) {
          errors.value[field] = 'Mínimo de 8 caracteres'
          isValid = false
          continue
        }
      }

      if (fieldRules.custom) {
        const result = fieldRules.custom(value)
        if (result !== true) {
          errors.value[field] = typeof result === 'string' ? result : 'Valor inválido'
          isValid = false
        }
      }
    }

    return isValid
  }

  const getError = (field: string): string | undefined => {
    return errors.value[field]
  }

  const hasError = (field: string): boolean => {
    return !!errors.value[field]
  }

  const clearErrors = () => {
    errors.value = {}
  }

  const clearFieldError = (field: string) => {
    delete errors.value[field]
  }

  return {
    errors: readonly(errors),
    validate,
    getError,
    hasError,
    clearErrors,
    clearFieldError,
  }
}