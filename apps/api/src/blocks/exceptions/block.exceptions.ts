import { HttpStatus } from '@nestjs/common';
import { DomainException } from '../../common-areas/exceptions/common-area.exceptions';

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

export class BlockAccessDeniedException extends DomainException {
  constructor(action: string) {
    super({
      code: 'BLOCK_ACCESS_DENIED',
      message: `Apenas administradores podem ${action} blocos.`,
      statusCode: HttpStatus.FORBIDDEN,
      details: { action },
    });
  }
}

export class BlockNameConflictException extends DomainException {
  constructor(name: string) {
    super({
      code: 'BLOCK_NAME_CONFLICT',
      message: `Já existe um bloco com o nome "${name}".`,
      statusCode: HttpStatus.CONFLICT,
      details: { name },
    });
  }
}

export class BlockHasUnitsException extends DomainException {
  constructor(blockId: string) {
    super({
      code: 'BLOCK_HAS_UNITS',
      message: `Bloco com ID ${blockId} possui unidades vinculadas e não pode ser removido.`,
      statusCode: HttpStatus.CONFLICT,
      details: { blockId },
    });
  }
}
