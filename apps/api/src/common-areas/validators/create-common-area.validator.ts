import { Injectable } from '@nestjs/common';
import { CreateCommonAreaValidationResult } from '../interfaces/common-areas.interface';

@Injectable()
export class CreateCommonAreaValidator {
  private readonly MIN_NAME_LENGTH = 2;
  private readonly MAX_NAME_LENGTH = 120;
  private readonly MAX_CAPACITY = 10000;
  private readonly TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

  validate(input: any): CreateCommonAreaValidationResult {
    const errors: string[] = [];

    if (!input.name || input.name.trim().length === 0) {
      errors.push('O nome é obrigatório.');
    } else {
      if (input.name.trim().length < this.MIN_NAME_LENGTH) {
        errors.push(`O nome deve ter pelo menos ${this.MIN_NAME_LENGTH} caracteres.`);
      }
      if (input.name.trim().length > this.MAX_NAME_LENGTH) {
        errors.push(`O nome deve ter no máximo ${this.MAX_NAME_LENGTH} caracteres.`);
      }
    }

    if (!input.openTime) {
      errors.push('O horário de abertura é obrigatório.');
    } else if (!this.TIME_REGEX.test(input.openTime)) {
      errors.push('O horário de abertura deve estar no formato HH:MM (ex: 08:00).');
    }

    if (!input.closeTime) {
      errors.push('O horário de fechamento é obrigatório.');
    } else if (!this.TIME_REGEX.test(input.closeTime)) {
      errors.push('O horário de fechamento deve estar no formato HH:MM (ex: 22:00).');
    }

    if (input.capacity !== undefined && input.capacity !== null) {
      if (typeof input.capacity !== 'number' || input.capacity < 0) {
        errors.push('A capacidade deve ser um número não negativo.');
      } else if (input.capacity > this.MAX_CAPACITY) {
        errors.push(`A capacidade não pode exceder ${this.MAX_CAPACITY}.`);
      }
    }

    if (input.operatingDays) {
      const days = input.operatingDays.split(',').map((d: string) => d.trim());
      for (const day of days) {
        const num = parseInt(day, 10);
        if (isNaN(num) || num < 1 || num > 7) {
          errors.push('Os dias de funcionamento devem ser números de 1 a 7 separados por vírgula (ex: 1,2,3,4,5,6,7).');
          break;
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
