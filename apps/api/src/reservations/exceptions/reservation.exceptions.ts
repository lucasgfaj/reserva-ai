import { HttpStatus } from '@nestjs/common';
import { DomainException } from '../../common-areas/exceptions/common-area.exceptions';

export class ReservationConflictException extends DomainException {
  constructor() {
    super({
      code: 'RESERVATION_CONFLICT',
      message: 'Já existe uma reserva neste horário para esta área.',
      statusCode: HttpStatus.CONFLICT,
    });
  }
}

export class ResidentNotFoundException extends DomainException {
  constructor() {
    super({
      code: 'RESIDENT_NOT_FOUND',
      message: 'Perfil de morador não encontrado.',
      statusCode: HttpStatus.NOT_FOUND,
    });
  }
}

export class ResidentCannotBookException extends DomainException {
  constructor() {
    super({
      code: 'RESIDENT_CANNOT_BOOK',
      message: 'Este morador não pode realizar reservas.',
      statusCode: HttpStatus.FORBIDDEN,
    });
  }
}

export class ReservationNotFoundException extends DomainException {
  constructor(id: string) {
    super({
      code: 'RESERVATION_NOT_FOUND',
      message: `Reserva com ID ${id} não encontrada.`,
      statusCode: HttpStatus.NOT_FOUND,
      details: { reservationId: id },
    });
  }
}

export class ReservationAlreadyCanceledException extends DomainException {
  constructor() {
    super({
      code: 'RESERVATION_ALREADY_CANCELED',
      message: 'Esta reserva já foi cancelada.',
      statusCode: HttpStatus.CONFLICT,
    });
  }
}

export class ReservationAccessDeniedException extends DomainException {
  constructor() {
    super({
      code: 'RESERVATION_ACCESS_DENIED',
      message: 'Você não tem permissão para cancelar esta reserva.',
      statusCode: HttpStatus.FORBIDDEN,
    });
  }
}
