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
      errors.push('email is required');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('email must be a valid email address');
    }
  }

  private validatePassword(password: string, errors: string[]): void {
    if (!password || password.length === 0) {
      errors.push('password is required');
      return;
    }
    if (password.length < this.MIN_PASSWORD_LENGTH) {
      errors.push(`password must be at least ${this.MIN_PASSWORD_LENGTH} characters`);
    }
  }
}