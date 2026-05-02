import { Injectable } from '@nestjs/common';
import { RegisterTenantInput } from '../interfaces/auth.interface';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

@Injectable()
export class RegisterTenantValidator {
  private readonly MIN_PASSWORD_LENGTH = 8;
  private readonly MAX_PASSWORD_LENGTH = 40;
  private readonly MIN_CONDOMINIUM_NAME_LENGTH = 3;
  private readonly MAX_CONDOMINIUM_NAME_LENGTH = 150;
  private readonly MAX_ADDRESS_LENGTH = 255;
  private readonly MAX_NAME_LENGTH = 120;
  private readonly PASSWORD_REGEX =
    /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/;

  validate(input: RegisterTenantInput): ValidationResult {
    const errors: string[] = [];

    this.validateCondominiumName(input.condominiumName, errors);
    this.validateCondominiumAddress(input.condominiumAddress, errors);
    this.validateAdminName(input.adminName, errors);
    this.validateAdminEmail(input.adminEmail, errors);
    this.validateAdminPassword(input.adminPassword, errors);

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private validateCondominiumName(name: string, errors: string[]): void {
    if (!name || name.trim().length === 0) {
      errors.push('Nome do condomínio é obrigatório');
      return;
    }
    if (name.trim().length < this.MIN_CONDOMINIUM_NAME_LENGTH) {
      errors.push(
        `Nome do condomínio deve ter pelo menos ${this.MIN_CONDOMINIUM_NAME_LENGTH} caracteres`,
      );
    }
    if (name.trim().length > this.MAX_CONDOMINIUM_NAME_LENGTH) {
      errors.push(
        `Nome do condomínio não pode exceder ${this.MAX_CONDOMINIUM_NAME_LENGTH} caracteres`,
      );
    }
  }

  private validateCondominiumAddress(address: string, errors: string[]): void {
    if (!address || address.trim().length === 0) {
      errors.push('Endereço do condomínio é obrigatório');
      return;
    }
    if (address.trim().length > this.MAX_ADDRESS_LENGTH) {
      errors.push(
        `Endereço não pode exceder ${this.MAX_ADDRESS_LENGTH} caracteres`,
      );
    }
  }

  private validateAdminName(name: string, errors: string[]): void {
    if (!name || name.trim().length === 0) {
      errors.push('Nome do administrador é obrigatório');
      return;
    }
    if (name.trim().length > this.MAX_NAME_LENGTH) {
      errors.push(`Nome não pode exceder ${this.MAX_NAME_LENGTH} caracteres`);
    }
  }

  private validateAdminEmail(email: string, errors: string[]): void {
    if (!email || email.trim().length === 0) {
      errors.push('E-mail do administrador é obrigatório');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('E-mail do administrador deve ser válido');
    }
  }

  private validateAdminPassword(password: string, errors: string[]): void {
    if (!password || password.length === 0) {
      errors.push('Senha do administrador é obrigatória');
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
      errors.push(
        'Senha deve conter pelo menos uma letra, um número e um caractere especial (!@#$%^&*)',
      );
    }
  }
}
