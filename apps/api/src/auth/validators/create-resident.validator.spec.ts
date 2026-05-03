import { CreateResidentValidator } from './create-resident.validator';
import { CreateResidentInput } from '../interfaces/auth.interface';

describe('CreateResidentValidator', () => {
  let validator: CreateResidentValidator;

  beforeEach(() => {
    validator = new CreateResidentValidator();
  });

  const baseInput: CreateResidentInput = {
    name: 'João Morador',
    email: 'joao@reservaai.com.br',
    canBook: true,
  };

  describe('validate', () => {
    it('should return isValid true for valid input with canBook true', () => {
      const result = validator.validate(baseInput);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return isValid true for valid input with canBook false', () => {
      const input = { ...baseInput, canBook: false };
      const result = validator.validate(input);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    describe('name validation', () => {
      it('should reject empty name', () => {
        const input = { ...baseInput, name: '' };
        const result = validator.validate(input);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Nome é obrigatório');
      });

      it('should reject name shorter than 3 characters', () => {
        const input = { ...baseInput, name: 'AB' };
        const result = validator.validate(input);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
          'Nome deve ter pelo menos 3 caracteres',
        );
      });

      it('should reject name longer than 120 characters', () => {
        const input = { ...baseInput, name: 'A'.repeat(121) };
        const result = validator.validate(input);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Nome não pode exceder 120 caracteres');
      });
    });

    describe('email validation', () => {
      it('should reject empty email', () => {
        const input = { ...baseInput, email: '' };
        const result = validator.validate(input);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('E-mail é obrigatório');
      });

      it('should reject invalid email format', () => {
        const input = { ...baseInput, email: 'not-an-email' };
        const result = validator.validate(input);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('E-mail deve ser um endereço válido');
      });
    });

    describe('password validation', () => {
      it('should accept empty password (will generate temporary)', () => {
        const input = { ...baseInput, password: undefined };
        const result = validator.validate(input);
        expect(result.isValid).toBe(true);
      });

      it('should reject password shorter than 8 characters', () => {
        const input = { ...baseInput, password: 'Ab1' };
        const result = validator.validate(input);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
          'Senha deve ter pelo menos 8 caracteres',
        );
      });

      it('should reject password longer than 40 characters', () => {
        const input = { ...baseInput, password: 'A'.repeat(41) };
        const result = validator.validate(input);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Senha não pode exceder 40 caracteres');
      });

      it('should reject password without letter', () => {
        const input = { ...baseInput, password: '12345678' };
        const result = validator.validate(input);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
          'Senha deve conter pelo menos uma letra e um número',
        );
      });

      it('should reject password without number', () => {
        const input = { ...baseInput, password: 'Abcdefgh' };
        const result = validator.validate(input);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
          'Senha deve conter pelo menos uma letra e um número',
        );
      });
    });
  });

  describe('generateTemporaryPassword', () => {
    it('should generate password with 8 characters', () => {
      const password = validator.generateTemporaryPassword();
      expect(password.length).toBe(8);
    });

    it('should contain only letters and numbers', () => {
      const password = validator.generateTemporaryPassword();
      expect(password).toMatch(/^[a-zA-Z0-9]+$/);
    });
  });
});
