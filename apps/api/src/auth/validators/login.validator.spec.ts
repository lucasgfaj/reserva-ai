import { LoginValidator } from './login.validator';
import { LoginInput } from '../interfaces/auth.interface';

describe('LoginValidator', () => {
  let validator: LoginValidator;

  beforeEach(() => {
    validator = new LoginValidator();
  });

  it('should be defined', () => {
    expect(validator).toBeDefined();
  });

  describe('validate', () => {
    it('should return valid for correct input', () => {
      const input: LoginInput = {
        email: 'admin@teste.com.br',
        password: 'Senha123!',
      };

      const result = validator.validate(input);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return error when email is empty', () => {
      const input: LoginInput = {
        email: '',
        password: 'Senha123!',
      };

      const result = validator.validate(input);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('email is required');
    });

    it('should return error when email is invalid', () => {
      const input: LoginInput = {
        email: 'invalid-email',
        password: 'Senha123!',
      };

      const result = validator.validate(input);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('email must be a valid email address');
    });

    it('should return error when password is empty', () => {
      const input: LoginInput = {
        email: 'admin@teste.com.br',
        password: '',
      };

      const result = validator.validate(input);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('password is required');
    });

    it('should return error when password is too short', () => {
      const input: LoginInput = {
        email: 'admin@teste.com.br',
        password: '123',
      };

      const result = validator.validate(input);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'password must be at least 8 characters',
      );
    });

    it('should return multiple errors when both fields are invalid', () => {
      const input: LoginInput = {
        email: '',
        password: '',
      };

      const result = validator.validate(input);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });
});