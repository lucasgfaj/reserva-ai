import { Test, TestingModule } from '@nestjs/testing';
import { CreateCommonAreaValidator } from './create-common-area.validator';

describe('CreateCommonAreaValidator', () => {
  let validator: CreateCommonAreaValidator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CreateCommonAreaValidator],
    }).compile();

    validator = module.get<CreateCommonAreaValidator>(CreateCommonAreaValidator);
  });

  const validInput = () => ({
    name: 'Salão de Festas',
    openTime: '08:00',
    closeTime: '22:00',
    capacity: 50,
    requiresApproval: false,
    operatingDays: '1,2,3,4,5,6,7',
  });

  it('should be defined', () => {
    expect(validator).toBeDefined();
  });

  it('should accept a valid input', () => {
    const result = validator.validate(validInput());
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject empty name', () => {
    const result = validator.validate({ ...validInput(), name: '' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('O nome é obrigatório.');
  });

  it('should reject name too short', () => {
    const result = validator.validate({ ...validInput(), name: 'A' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('O nome deve ter pelo menos 2 caracteres.');
  });

  it('should reject name too long', () => {
    const result = validator.validate({ ...validInput(), name: 'A'.repeat(121) });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('O nome deve ter no máximo 120 caracteres.');
  });

  it('should reject missing openTime', () => {
    const result = validator.validate({ ...validInput(), openTime: '' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('O horário de abertura é obrigatório.');
  });

  it('should reject invalid openTime format', () => {
    const result = validator.validate({ ...validInput(), openTime: '25:00' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('O horário de abertura deve estar no formato HH:MM (ex: 08:00).');
  });

  it('should reject missing closeTime', () => {
    const result = validator.validate({ ...validInput(), closeTime: '' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('O horário de fechamento é obrigatório.');
  });

  it('should reject invalid closeTime format', () => {
    const result = validator.validate({ ...validInput(), closeTime: '99:99' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('O horário de fechamento deve estar no formato HH:MM (ex: 22:00).');
  });

  it('should accept null capacity', () => {
    const result = validator.validate({ ...validInput(), capacity: null });
    expect(result.isValid).toBe(true);
  });

  it('should reject negative capacity', () => {
    const result = validator.validate({ ...validInput(), capacity: -1 });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('A capacidade deve ser um número não negativo.');
  });

  it('should reject capacity exceeding limit', () => {
    const result = validator.validate({ ...validInput(), capacity: 10001 });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('A capacidade não pode exceder 10000.');
  });

  it('should reject invalid operating days', () => {
    const result = validator.validate({ ...validInput(), operatingDays: '0,8,abc' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Os dias de funcionamento devem ser números de 1 a 7 separados por vírgula (ex: 1,2,3,4,5,6,7).');
  });

  it('should accept undefined operatingDays', () => {
    const { operatingDays, ...input } = validInput();
    const result = validator.validate(input);
    expect(result.isValid).toBe(true);
  });

  it('should collect multiple errors', () => {
    const result = validator.validate({});
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(3);
  });
});