import { RegisterTenantValidator } from './register-tenant.validator';
import { RegisterTenantInput } from '../interfaces/auth.interface';

describe('RegisterTenantValidator', () => {
  let validator: RegisterTenantValidator;

  beforeEach(() => {
    validator = new RegisterTenantValidator();
  });

  const validInput: RegisterTenantInput = {
    condominiumName: 'Residencial Horizonte',
    condominiumAddress: 'Rua das Flores, 123',
    adminName: 'Lucas Admin',
    adminEmail: 'admin@reservaai.com.br',
    adminPassword: 'Senha123!',
  };

  describe('validate', () => {
    it('should return isValid true for valid input', () => {
      const result = validator.validate(validInput);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    describe('condominiumName validation', () => {
      it('should reject empty condominiumName', () => {
        const input = { ...validInput, condominiumName: '' };
        const result = validator.validate(input);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('condominiumName is required');
      });

      it('should reject name shorter than 3 characters', () => {
        const input = { ...validInput, condominiumName: 'AB' };
        const result = validator.validate(input);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('condominiumName must be at least 3 characters');
      });

      it('should reject name longer than 150 characters', () => {
        const input = { ...validInput, condominiumName: 'A'.repeat(151) };
        const result = validator.validate(input);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('condominiumName must not exceed 150 characters');
      });
    });

    describe('condominiumAddress validation', () => {
      it('should reject empty address', () => {
        const input = { ...validInput, condominiumAddress: '' };
        const result = validator.validate(input);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('condominiumAddress is required');
      });

      it('should reject address longer than 255 characters', () => {
        const input = { ...validInput, condominiumAddress: 'A'.repeat(256) };
        const result = validator.validate(input);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('condominiumAddress must not exceed 255 characters');
      });
    });

    describe('adminEmail validation', () => {
      it('should reject empty email', () => {
        const input = { ...validInput, adminEmail: '' };
        const result = validator.validate(input);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('adminEmail is required');
      });

      it('should reject invalid email format', () => {
        const input = { ...validInput, adminEmail: 'not-an-email' };
        const result = validator.validate(input);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('adminEmail must be a valid email address');
      });
    });

    describe('adminPassword validation', () => {
      it('should reject empty password', () => {
        const input = { ...validInput, adminPassword: '' };
        const result = validator.validate(input);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('adminPassword is required');
      });

      it('should reject password shorter than 8 characters', () => {
        const input = { ...validInput, adminPassword: 'Ab1!' };
        const result = validator.validate(input);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('adminPassword must be at least 8 characters');
      });

      it('should reject password longer than 40 characters', () => {
        const input = { ...validInput, adminPassword: 'A'.repeat(41) + '1!' };
        const result = validator.validate(input);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('adminPassword must not exceed 40 characters');
      });

      it('should reject password without letter', () => {
        const input = { ...validInput, adminPassword: '12345678!' };
        const result = validator.validate(input);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('adminPassword must contain at least one letter, one number, and one special character (!@#$%^&*)');
      });

      it('should reject password without number', () => {
        const input = { ...validInput, adminPassword: 'Abcdefgh!' };
        const result = validator.validate(input);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('adminPassword must contain at least one letter, one number, and one special character (!@#$%^&*)');
      });

      it('should reject password without special character', () => {
        const input = { ...validInput, adminPassword: 'Abcdefgh1' };
        const result = validator.validate(input);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('adminPassword must contain at least one letter, one number, and one special character (!@#$%^&*)');
      });
    });
  });
});