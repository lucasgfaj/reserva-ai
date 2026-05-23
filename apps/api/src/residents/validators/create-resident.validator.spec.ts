import { Test, TestingModule } from '@nestjs/testing';
import { CreateResidentValidator } from './create-resident.validator';

describe('CreateResidentValidator', () => {
  let validator: CreateResidentValidator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CreateResidentValidator],
    }).compile();

    validator = module.get<CreateResidentValidator>(CreateResidentValidator);
  });

  const validInput = () => ({
    name: 'João Silva',
    email: 'joao@test.com',
  });

  it('should be defined', () => {
    expect(validator).toBeDefined();
  });

  it('should accept a valid input', () => {
    const result = validator.validate(validInput());
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should accept a valid input with password', () => {
    const result = validator.validate({ ...validInput(), password: 'Senha1234' });
    expect(result.isValid).toBe(true);
  });

  it('should reject empty name', () => {
    const result = validator.validate({ ...validInput(), name: '' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('O nome é obrigatório.');
  });

  it('should reject name too short', () => {
    const result = validator.validate({ ...validInput(), name: 'Jo' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('O nome deve ter pelo menos 3 caracteres.');
  });

  it('should reject name too long', () => {
    const result = validator.validate({ ...validInput(), name: 'A'.repeat(121) });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('O nome deve ter no máximo 120 caracteres.');
  });

  it('should reject empty email', () => {
    const result = validator.validate({ ...validInput(), email: '' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('O e-mail é obrigatório.');
  });

  it('should reject invalid email format', () => {
    const result = validator.validate({ ...validInput(), email: 'invalido' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('O e-mail deve ser um endereço válido.');
  });

  it('should reject short password', () => {
    const result = validator.validate({ ...validInput(), password: 'Ab1' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('A senha deve ter pelo menos 8 caracteres.');
  });

  it('should reject long password', () => {
    const result = validator.validate({ ...validInput(), password: 'A'.repeat(41) });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('A senha deve ter no máximo 40 caracteres.');
  });

  it('should reject password without letter and number', () => {
    const result = validator.validate({ ...validInput(), password: '12345678' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('A senha deve conter pelo menos uma letra e um número.');
  });

  it('should accept empty password (will be auto-generated)', () => {
    const result = validator.validate({ ...validInput(), password: '' });
    expect(result.isValid).toBe(true);
  });

  it('should reject document exceeding max length', () => {
    const result = validator.validate({ ...validInput(), document: 'A'.repeat(21) });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('O documento deve ter no máximo 20 caracteres.');
  });

  it('should reject phone exceeding max length', () => {
    const result = validator.validate({ ...validInput(), phone: 'A'.repeat(21) });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('O telefone deve ter no máximo 20 caracteres.');
  });

  it('should generate a temporary password of 8 characters', () => {
    const password = validator.generateTemporaryPassword();
    expect(password).toHaveLength(8);
  });

  it('should generate different passwords each call', () => {
    const p1 = validator.generateTemporaryPassword();
    const p2 = validator.generateTemporaryPassword();
    expect(p1).not.toBe(p2);
  });
});