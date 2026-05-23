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

export class CommonAreaNotFoundException extends DomainException {
  constructor(areaId: string) {
    super({
      code: 'COMMON_AREA_NOT_FOUND',
      message: `Área comum com ID ${areaId} não foi encontrada.`,
      statusCode: HttpStatus.NOT_FOUND,
      details: { areaId },
    });
  }
}

export class CommonAreaAccessDeniedException extends DomainException {
  constructor(action: string) {
    super({
      code: 'COMMON_AREA_ACCESS_DENIED',
      message: `Apenas administradores podem ${action} áreas comuns.`,
      statusCode: HttpStatus.FORBIDDEN,
      details: { action },
    });
  }
}

export class TenantAccessDeniedException extends DomainException {
  constructor() {
    super({
      code: 'TENANT_ACCESS_DENIED',
      message: 'Você não tem permissão para acessar recursos deste condomínio.',
      statusCode: HttpStatus.FORBIDDEN,
    });
  }
}

export class CommonAreaValidationException extends DomainException {
  constructor(errors: string[]) {
    super({
      code: 'COMMON_AREA_VALIDATION_FAILED',
      message: 'Dados de entrada inválidos para a área comum.',
      statusCode: HttpStatus.BAD_REQUEST,
      details: { errors },
    });
  }
}

export class CommonAreaNameConflictException extends DomainException {
  constructor(name: string) {
    super({
      code: 'COMMON_AREA_NAME_CONFLICT',
      message: `Já existe uma área comum com o nome "${name}" neste condomínio.`,
      statusCode: HttpStatus.CONFLICT,
      details: { name },
    });
  }
}

export class CommonAreaHasReservationsException extends DomainException {
  constructor(areaId: string, count: number) {
    super({
      code: 'COMMON_AREA_HAS_RESERVATIONS',
      message: `Não é possível excluir a área comum pois ela possui ${count} reserva(s) ativa(s).`,
      statusCode: HttpStatus.CONFLICT,
      details: { areaId, reservationCount: count },
    });
  }
}
