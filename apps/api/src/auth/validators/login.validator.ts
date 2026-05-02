import { Injectable } from '@nestjs/common';
import { LoginInput } from '../interfaces/auth.interface';

export interface LoginValidationResult {
  isValid: boolean;
  errors: string[];
}

@Injectable()
export class LoginValidator {
  private readonly MIN_PASSWORD_LENGTH = 8;

  validate(input: LoginInput): LoginValidationResult {
    const errors: string[] = [];

    this.validateEmail(input.email, errors);
    this.validatePassword(input.password, errors);

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private validateEmail(email: string, errors: string[]): void {
    if (!email || email.trim().length === 0) {
      errors.push('E-mail é obrigatório');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('E-mail deve ser um endereço válido');
    }
  }

  private validatePassword(password: string, errors: string[]): void {
    if (!password || password.length === 0) {
      errors.push('Senha é obrigatória');
      return;
    }
    if (password.length < this.MIN_PASSWORD_LENGTH) {
      errors.push(`Senha deve ter pelo menos ${this.MIN_PASSWORD_LENGTH} caracteres`);
    }
  }
}