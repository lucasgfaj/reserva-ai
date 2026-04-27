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
  private readonly PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/;

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
      errors.push('condominiumName is required');
      return;
    }
    if (name.trim().length < this.MIN_CONDOMINIUM_NAME_LENGTH) {
      errors.push(`condominiumName must be at least ${this.MIN_CONDOMINIUM_NAME_LENGTH} characters`);
    }
    if (name.trim().length > this.MAX_CONDOMINIUM_NAME_LENGTH) {
      errors.push(`condominiumName must not exceed ${this.MAX_CONDOMINIUM_NAME_LENGTH} characters`);
    }
  }

  private validateCondominiumAddress(address: string, errors: string[]): void {
    if (!address || address.trim().length === 0) {
      errors.push('condominiumAddress is required');
      return;
    }
    if (address.trim().length > this.MAX_ADDRESS_LENGTH) {
      errors.push(`condominiumAddress must not exceed ${this.MAX_ADDRESS_LENGTH} characters`);
    }
  }

  private validateAdminName(name: string, errors: string[]): void {
    if (!name || name.trim().length === 0) {
      errors.push('adminName is required');
      return;
    }
    if (name.trim().length > this.MAX_NAME_LENGTH) {
      errors.push(`adminName must not exceed ${this.MAX_NAME_LENGTH} characters`);
    }
  }

  private validateAdminEmail(email: string, errors: string[]): void {
    if (!email || email.trim().length === 0) {
      errors.push('adminEmail is required');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('adminEmail must be a valid email address');
    }
  }

  private validateAdminPassword(password: string, errors: string[]): void {
    if (!password || password.length === 0) {
      errors.push('adminPassword is required');
      return;
    }
    if (password.length < this.MIN_PASSWORD_LENGTH) {
      errors.push(`adminPassword must be at least ${this.MIN_PASSWORD_LENGTH} characters`);
    }
    if (password.length > this.MAX_PASSWORD_LENGTH) {
      errors.push(`adminPassword must not exceed ${this.MAX_PASSWORD_LENGTH} characters`);
    }
    if (!this.PASSWORD_REGEX.test(password)) {
      errors.push('adminPassword must contain at least one letter, one number, and one special character (!@#$%^&*)');
    }
  }
}