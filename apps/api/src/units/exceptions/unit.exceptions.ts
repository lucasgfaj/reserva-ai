import { HttpStatus } from '@nestjs/common';
import { DomainException } from '../../common-areas/exceptions/common-area.exceptions';

export class UnitNotFoundException extends DomainException {
  constructor(unitId: string) {
    super({
      code: 'UNIT_NOT_FOUND',
      message: `Unidade com ID ${unitId} não foi encontrada.`,
      statusCode: HttpStatus.NOT_FOUND,
      details: { unitId },
    });
  }
}

export class UnitAccessDeniedException extends DomainException {
  constructor(action: string) {
    super({
      code: 'UNIT_ACCESS_DENIED',
      message: `Apenas administradores podem ${action} unidades.`,
      statusCode: HttpStatus.FORBIDDEN,
      details: { action },
    });
  }
}

export class UnitNumberConflictException extends DomainException {
  constructor(number: string) {
    super({
      code: 'UNIT_NUMBER_CONFLICT',
      message: `Já existe uma unidade com o número "${number}".`,
      statusCode: HttpStatus.CONFLICT,
      details: { number },
    });
  }
}

export class BlockNotFoundException extends DomainException {
  constructor(blockId: string) {
    super({
      code: 'BLOCK_NOT_FOUND',
      message: `Bloco com ID ${blockId} não foi encontrado.`,
      statusCode: HttpStatus.NOT_FOUND,
      details: { blockId },
    });
  }
}

export class UnitHasResidentsException extends DomainException {
  constructor(unitId: string) {
    super({
      code: 'UNIT_HAS_RESIDENTS',
      message: `Unidade com ID ${unitId} possui moradores vinculados e não pode ser removida.`,
      statusCode: HttpStatus.CONFLICT,
      details: { unitId },
    });
  }
}
