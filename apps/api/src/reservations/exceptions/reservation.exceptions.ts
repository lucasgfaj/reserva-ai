import { HttpStatus } from '@nestjs/common';
import { DomainException } from '../../common-areas/exceptions';

export class ReservationConflictException extends DomainException {
  constructor() {
    super({
      code: 'RESERVATION_CONFLICT',
      message: 'Já existe uma reserva para este horário na mesma área.',
      statusCode: HttpStatus.CONFLICT,
    });
  }
}

export class ResidentNotFoundException extends DomainException {
  constructor() {
    super({
      code: 'RESIDENT_NOT_FOUND',
      message: 'Morador não encontrado.',
      statusCode: HttpStatus.NOT_FOUND,
    });
  }
}

export class ResidentCannotBookException extends DomainException {
  constructor() {
    super({
      code: 'RESIDENT_CANNOT_BOOK',
      message: 'Este morador não possui permissão para realizar reservas.',
      statusCode: HttpStatus.FORBIDDEN,
    });
  }
}

export class ReservationNotFoundException extends DomainException {
  constructor(reservationId: string) {
    super({
      code: 'RESERVATION_NOT_FOUND',
      message: `Reserva com ID ${reservationId} não encontrada.`,
      statusCode: HttpStatus.NOT_FOUND,
      details: { reservationId },
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
      message: 'Você não tem permissão para modificar esta reserva.',
      statusCode: HttpStatus.FORBIDDEN,
    });
  }
}

export class ReservationNotPendingException extends DomainException {
  constructor(status: string) {
    super({
      code: 'RESERVATION_NOT_PENDING',
      message: `A reserva está ${status === 'APPROVED' ? 'aprovada' : status === 'REJECTED' ? 'rejeitada' : 'cancelada'}. Apenas reservas pendentes podem ser aprovadas ou rejeitadas.`,
      statusCode: HttpStatus.CONFLICT,
      details: { currentStatus: status },
    });
  }
}
