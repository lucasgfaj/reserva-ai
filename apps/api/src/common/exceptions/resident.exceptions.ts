import { HttpException, HttpStatus } from '@nestjs/common';

export interface DomainExceptionOptions {
  code: string;
  message: string;
  statusCode: number;
  details?: Record<string, unknown>;
}

export abstract class DomainException extends HttpException {
  public readonly code: string;
  public readonly details?: Record<string, unknown>;

  constructor(options: DomainExceptionOptions) {
    const response = {
      code: options.code,
      message: options.message,
      ...(options.details && { details: options.details }),
    };

    super(response, options.statusCode);

    this.code = options.code;
    this.details = options.details;
  }
}

export class ResidentNotFoundException extends DomainException {
  constructor(residentId: string) {
    super({
      code: 'RESIDENT_NOT_FOUND',
      message: `Morador com ID ${residentId} não foi encontrado.`,
      statusCode: HttpStatus.NOT_FOUND,
      details: { residentId },
    });
  }
}

export class ResidentAccessDeniedException extends DomainException {
  constructor(action: string) {
    super({
      code: 'RESIDENT_ACCESS_DENIED',
      message: `Apenas administradores podem ${action} moradores.`,
      statusCode: HttpStatus.FORBIDDEN,
      details: { action },
    });
  }
}

export class EmailAlreadyExistsException extends DomainException {
  constructor(email: string) {
    super({
      code: 'EMAIL_ALREADY_EXISTS',
      message: `O e-mail ${email} já está cadastrado no sistema.`,
      statusCode: HttpStatus.CONFLICT,
      details: { email },
    });
  }
}

export class ResidentValidationException extends DomainException {
  constructor(errors: string[]) {
    super({
      code: 'RESIDENT_VALIDATION_FAILED',
      message: 'Dados de entrada inválidos para o morador.',
      statusCode: HttpStatus.BAD_REQUEST,
      details: { errors },
    });
  }
}
