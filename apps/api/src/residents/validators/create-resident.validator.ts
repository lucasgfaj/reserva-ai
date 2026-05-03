import { Injectable } from '@nestjs/common';
import { CreateResidentInput } from '../interfaces/residents.interface';

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

  validate(input: CreateResidentInput): CreateResidentValidationResult {
    const errors: string[] = [];

    this.validateName(input.name, errors);
    this.validateEmail(input.email, errors);
    this.validatePassword(input.password, errors);
    this.validateDocument(input.document, errors);
    this.validatePhone(input.phone, errors);

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  generateTemporaryPassword(): string {
    const chars =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  private validateName(name: string, errors: string[]): void {
    if (!name || name.trim().length === 0) {
      errors.push('Nome é obrigatório');
      return;
    }
    if (name.trim().length < this.MIN_NAME_LENGTH) {
      errors.push(
        `Nome deve ter pelo menos ${this.MIN_NAME_LENGTH} caracteres`,
      );
    }
    if (name.trim().length > this.MAX_NAME_LENGTH) {
      errors.push(`Nome não pode exceder ${this.MAX_NAME_LENGTH} caracteres`);
    }
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

  private validatePassword(
    password: string | undefined,
    errors: string[],
  ): void {
    if (!password || password.length === 0) {
      return;
    }
    if (password.length < this.MIN_PASSWORD_LENGTH) {
      errors.push(
        `Senha deve ter pelo menos ${this.MIN_PASSWORD_LENGTH} caracteres`,
      );
    }
    if (password.length > this.MAX_PASSWORD_LENGTH) {
      errors.push(
        `Senha não pode exceder ${this.MAX_PASSWORD_LENGTH} caracteres`,
      );
    }
    if (!this.PASSWORD_REGEX.test(password)) {
      errors.push('Senha deve conter pelo menos uma letra e um número');
    }
  }

  private validateDocument(
    document: string | undefined,
    errors: string[],
  ): void {
    if (!document) {
      return;
    }
    if (document.length > this.MAX_DOCUMENT_LENGTH) {
      errors.push(
        `Documento não pode exceder ${this.MAX_DOCUMENT_LENGTH} caracteres`,
      );
    }
  }

  private validatePhone(phone: string | undefined, errors: string[]): void {
    if (!phone) {
      return;
    }
    if (phone.length > this.MAX_PHONE_LENGTH) {
      errors.push(
        `Telefone não pode exceder ${this.MAX_PHONE_LENGTH} caracteres`,
      );
    }
  }
}
