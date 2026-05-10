import { Injectable } from '@nestjs/common';

export interface CreateResidentValidationResult {
  isValid: boolean;
  errors: string[];
}

@Injectable()
export class CreateResidentValidator {
  private readonly MIN_PASSWORD_LENGTH = 8;
  private readonly MAX_PASSWORD_LENGTH = 40;
  private readonly MIN_NAME_LENGTH = 3;
  private readonly MAX_NAME_LENGTH = 120;
  private readonly MAX_DOCUMENT_LENGTH = 20;
  private readonly MAX_PHONE_LENGTH = 20;
  private readonly PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*[0-9])/;

  validate(input: any): CreateResidentValidationResult {
    const errors: string[] = [];

    if (!input.name || input.name.trim().length === 0) {
      errors.push('O nome é obrigatório.');
    } else {
      if (input.name.trim().length < this.MIN_NAME_LENGTH) {
        errors.push(`O nome deve ter pelo menos ${this.MIN_NAME_LENGTH} caracteres.`);
      }
      if (input.name.trim().length > this.MAX_NAME_LENGTH) {
        errors.push(`O nome deve ter no máximo ${this.MAX_NAME_LENGTH} caracteres.`);
      }
    }

    if (!input.email || input.email.trim().length === 0) {
      errors.push('O e-mail é obrigatório.');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(input.email)) {
        errors.push('O e-mail deve ser um endereço válido.');
      }
    }

    if (input.password) {
      if (input.password.length < this.MIN_PASSWORD_LENGTH) {
        errors.push(`A senha deve ter pelo menos ${this.MIN_PASSWORD_LENGTH} caracteres.`);
      }
      if (input.password.length > this.MAX_PASSWORD_LENGTH) {
        errors.push(`A senha deve ter no máximo ${this.MAX_PASSWORD_LENGTH} caracteres.`);
      }
      if (!this.PASSWORD_REGEX.test(input.password)) {
        errors.push('A senha deve conter pelo menos uma letra e um número.');
      }
    }

    if (input.document && input.document.length > this.MAX_DOCUMENT_LENGTH) {
      errors.push(`O documento deve ter no máximo ${this.MAX_DOCUMENT_LENGTH} caracteres.`);
    }

    if (input.phone && input.phone.length > this.MAX_PHONE_LENGTH) {
      errors.push(`O telefone deve ter no máximo ${this.MAX_PHONE_LENGTH} caracteres.`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  generateTemporaryPassword(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
}
