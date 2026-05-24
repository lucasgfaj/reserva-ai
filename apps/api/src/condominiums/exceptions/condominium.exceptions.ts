import { HttpStatus } from '@nestjs/common';
import { DomainException } from '../../common-areas/exceptions';

export class CondominiumNotFoundException extends DomainException {
  constructor() {
    super({
      code: 'CONDOMINIUM_NOT_FOUND',
      message: 'Condomínio não encontrado.',
      statusCode: HttpStatus.NOT_FOUND,
    });
  }
}

export class CondominiumAccessDeniedException extends DomainException {
  constructor() {
    super({
      code: 'CONDOMINIUM_ACCESS_DENIED',
      message: 'Você não tem permissão para acessar este condomínio.',
      statusCode: HttpStatus.FORBIDDEN,
    });
  }
}
