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
        expect(result.errors).toContain('Nome do condomínio é obrigatório');
      });

      it('should reject name shorter than 3 characters', () => {
        const input = { ...validInput, condominiumName: 'AB' };
        const result = validator.validate(input);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
          'Nome do condomínio deve ter pelo menos 3 caracteres',
        );
      });

      it('should reject name longer than 150 characters', () => {
        const input = { ...validInput, condominiumName: 'A'.repeat(151) };
        const result = validator.validate(input);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
          'Nome do condomínio não pode exceder 150 caracteres',
        );
      });
    });

    describe('condominiumAddress validation', () => {
      it('should reject empty address', () => {
        const input = { ...validInput, condominiumAddress: '' };
        const result = validator.validate(input);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Endereço do condomínio é obrigatório');
      });

      it('should reject address longer than 255 characters', () => {
        const input = { ...validInput, condominiumAddress: 'A'.repeat(256) };
        const result = validator.validate(input);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
          'Endereço não pode exceder 255 caracteres',
        );
      });
    });

    describe('adminEmail validation', () => {
      it('should reject empty email', () => {
        const input = { ...validInput, adminEmail: '' };
        const result = validator.validate(input);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
          'E-mail do administrador é obrigatório',
        );
      });

      it('should reject invalid email format', () => {
        const input = { ...validInput, adminEmail: 'not-an-email' };
        const result = validator.validate(input);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
          'E-mail do administrador deve ser válido',
        );
      });
    });

    describe('adminPassword validation', () => {
      it('should reject empty password', () => {
        const input = { ...validInput, adminPassword: '' };
        const result = validator.validate(input);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Senha do administrador é obrigatória');
      });

      it('should reject password shorter than 8 characters', () => {
        const input = { ...validInput, adminPassword: 'Ab1!' };
        const result = validator.validate(input);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
          'Senha deve ter pelo menos 8 caracteres',
        );
      });

      it('should reject password longer than 40 characters', () => {
        const input = { ...validInput, adminPassword: 'A'.repeat(41) + '1!' };
        const result = validator.validate(input);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Senha não pode exceder 40 caracteres');
      });

      it('should reject password without letter', () => {
        const input = { ...validInput, adminPassword: '12345678!' };
        const result = validator.validate(input);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
          'Senha deve conter pelo menos uma letra, um número e um caractere especial (!@#$%^&*)',
        );
      });

      it('should reject password without number', () => {
        const input = { ...validInput, adminPassword: 'Abcdefgh!' };
        const result = validator.validate(input);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
          'Senha deve conter pelo menos uma letra, um número e um caractere especial (!@#$%^&*)',
        );
      });

      it('should reject password without special character', () => {
        const input = { ...validInput, adminPassword: 'Abcdefgh1' };
        const result = validator.validate(input);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
          'Senha deve conter pelo menos uma letra, um número e um caractere especial (!@#$%^&*)',
        );
      });
    });
  });
});
