import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import {
  CommonAreaNotFoundException,
  CommonAreaAccessDeniedException,
  TenantAccessDeniedException,
  CommonAreaValidationException,
} from '../common-areas/exceptions';
import {
  ReservationConflictException,
  ResidentNotFoundException,
  ResidentCannotBookException,
  ReservationNotFoundException,
  ReservationAlreadyCanceledException,
  ReservationAccessDeniedException,
  ReservationNotPendingException,
} from './exceptions';
import {
  CreateReservationInput,
  ReservationOutput,
  ReservationListOutput,
  ListReservationsQuery,
} from './interfaces/reservation.interface';

interface ServiceContext {
  role: string;
  condominiumId: string | null;
  userId: string;
}

@Injectable()
export class ReservationsService {
  constructor(private readonly prisma: PrismaService) {}

  async createReservation(
    input: CreateReservationInput,
    context: ServiceContext,
  ): Promise<ReservationOutput> {
    if (!context.condominiumId) {
      throw new CommonAreaAccessDeniedException('reservar');
    }

    const commonArea = await this.prisma.commonArea.findFirst({
      where: { id: input.commonAreaId },
    });

    if (!commonArea) {
      throw new CommonAreaNotFoundException(input.commonAreaId);
    }

    if (commonArea.condominiumId !== context.condominiumId) {
      throw new TenantAccessDeniedException();
    }

    if (commonArea.isUnderMaintenance) {
      throw new CommonAreaValidationException([
        'Esta área está em manutenção.',
      ]);
    }

    const requestedDate = new Date(input.date + 'T12:00:00Z');
    const dayOfWeek = ((requestedDate.getUTCDay() + 6) % 7) + 1;

    const operatingDays: number[] = typeof commonArea.operatingDays === 'string'
      ? commonArea.operatingDays.split(',').map(Number)
      : Array.isArray(commonArea.operatingDays)
        ? commonArea.operatingDays.map(Number)
        : [];

    if (!operatingDays.includes(dayOfWeek)) {
      throw new CommonAreaValidationException([
        'Esta área não funciona no dia solicitado.',
      ]);
    }

    const { startTime, endTime } = input;

    if (startTime < commonArea.openTime) {
      throw new CommonAreaValidationException([
        `O horário de início (${startTime}) é antes da abertura (${commonArea.openTime}).`,
      ]);
    }

    if (endTime > commonArea.closeTime) {
      throw new CommonAreaValidationException([
        `O horário de fim (${endTime}) é depois do fechamento (${commonArea.closeTime}).`,
      ]);
    }

    if (startTime >= endTime) {
      throw new CommonAreaValidationException([
        'O horário de início deve ser anterior ao horário de fim.',
      ]);
    }

    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const durationMinutes = (endH * 60 + endM) - (startH * 60 + startM);

    if (durationMinutes < 120) {
      throw new CommonAreaValidationException([
        'A reserva deve ter no mínimo 2 horas de duração.',
      ]);
    }

    let residentId = input.residentId;

    if (context.role === Role.RESIDENT) {
      const resident = await this.prisma.resident.findUnique({
        where: { userId: context.userId },
      });

      if (!resident) {
        throw new ResidentNotFoundException();
      }

      if (!resident.canBook) {
        throw new ResidentCannotBookException();
      }

      residentId = resident.id;
    }

    if (!residentId) {
      throw new CommonAreaValidationException([
        'Morador não identificado para a reserva.',
      ]);
    }

    const startDateTime = new Date(`${input.date}T${startTime}:00.000Z`);
    const endDateTime = new Date(`${input.date}T${endTime}:00.000Z`);

    const conflicts = await this.prisma.reservation.findMany({
      where: {
        commonAreaId: input.commonAreaId,
        status: { in: ['PENDING', 'APPROVED'] },
        startTime: { lt: endDateTime },
        endTime: { gt: startDateTime },
      },
      take: 1,
    });

    if (conflicts.length > 0) {
      throw new ReservationConflictException();
    }

    const status = commonArea.requiresApproval ? 'PENDING' : 'APPROVED';

    const reservation = await this.prisma.reservation.create({
      data: {
        residentId,
        commonAreaId: input.commonAreaId,
        startTime: startDateTime,
        endTime: endDateTime,
        status,
        notes: input.notes,
      },
    });

    return reservation as ReservationOutput;
  }

  async listReservations(
    context: ServiceContext,
    query?: ListReservationsQuery,
  ): Promise<ReservationListOutput> {
    if (!context.condominiumId) {
      throw new CommonAreaAccessDeniedException('listar');
    }

    let residentId: string | undefined;

    if (context.role === Role.RESIDENT) {
      const resident = await this.prisma.resident.findUnique({
        where: { userId: context.userId },
      });

      if (!resident) {
        throw new ResidentNotFoundException();
      }

      residentId = resident.id;
    }

    const page = query?.page ?? 1;
    const limit = query?.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (residentId) {
      where.residentId = residentId;
    } else {
      where.commonArea = { condominiumId: context.condominiumId };
    }

    if (query?.status) {
      const statuses = query.status.split(',').map((s) => s.trim()).filter(Boolean);
      if (statuses.length === 1) {
        where.status = statuses[0];
      } else if (statuses.length > 1) {
        where.status = { in: statuses };
      }
    }

    if (query?.from) {
      where.endTime = { gte: new Date(query.from + 'T00:00:00.000Z') };
    }

    if (query?.to) {
      where.startTime = { lte: new Date(query.to + 'T23:59:59.999Z') };
    }

    const [reservations, total] = await Promise.all([
      this.prisma.reservation.findMany({
        where,
        include: {
          commonArea: { select: { id: true, name: true, icon: true, capacity: true } },
          resident: {
            select: {
              id: true,
              user: { select: { name: true, email: true } },
            },
          },
        },
        orderBy: { startTime: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.reservation.count({ where }),
    ]);

    return {
      reservations: reservations as unknown as ReservationOutput[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async cancelReservation(
    reservationId: string,
    context: ServiceContext,
  ): Promise<ReservationOutput> {
    const reservation = await this.prisma.reservation.findFirst({
      where: { id: reservationId },
      include: {
        commonArea: { select: { condominiumId: true } },
      },
    });

    if (!reservation) {
      throw new ReservationNotFoundException(reservationId);
    }

    if (reservation.commonArea.condominiumId !== context.condominiumId) {
      throw new TenantAccessDeniedException();
    }

    if (reservation.status === 'CANCELED') {
      throw new ReservationAlreadyCanceledException();
    }

    if (context.role === Role.RESIDENT) {
      const resident = await this.prisma.resident.findUnique({
        where: { userId: context.userId },
      });

      if (!resident || resident.id !== reservation.residentId) {
        throw new ReservationAccessDeniedException();
      }
    }

    const updated = await this.prisma.reservation.update({
      where: { id: reservationId },
      data: {
        status: 'CANCELED',
        canceledById: context.userId,
        canceledAt: new Date(),
      },
    });

    return updated as ReservationOutput;
  }

  async approveReservation(
    reservationId: string,
    context: ServiceContext,
  ): Promise<ReservationOutput> {
    if (context.role !== Role.ADMIN) {
      throw new ReservationAccessDeniedException();
    }

    const reservation = await this.prisma.reservation.findFirst({
      where: { id: reservationId },
      include: {
        commonArea: { select: { condominiumId: true } },
      },
    });

    if (!reservation) {
      throw new ReservationNotFoundException(reservationId);
    }

    if (reservation.commonArea.condominiumId !== context.condominiumId) {
      throw new TenantAccessDeniedException();
    }

    if (reservation.status !== 'PENDING') {
      throw new ReservationNotPendingException(reservation.status);
    }

    const [updated] = await this.prisma.$transaction([
      this.prisma.reservation.update({
        where: { id: reservationId },
        data: { status: 'APPROVED' },
      }),
      this.prisma.reservationApproval.create({
        data: {
          reservationId,
          approvedBy: context.userId,
          approvedAt: new Date(),
          status: 'APPROVED',
        },
      }),
    ]);

    return updated as ReservationOutput;
  }

  async rejectReservation(
    reservationId: string,
    context: ServiceContext,
  ): Promise<ReservationOutput> {
    if (context.role !== Role.ADMIN) {
      throw new ReservationAccessDeniedException();
    }

    const reservation = await this.prisma.reservation.findFirst({
      where: { id: reservationId },
      include: {
        commonArea: { select: { condominiumId: true } },
      },
    });

    if (!reservation) {
      throw new ReservationNotFoundException(reservationId);
    }

    if (reservation.commonArea.condominiumId !== context.condominiumId) {
      throw new TenantAccessDeniedException();
    }

    if (reservation.status !== 'PENDING') {
      throw new ReservationNotPendingException(reservation.status);
    }

    const [updated] = await this.prisma.$transaction([
      this.prisma.reservation.update({
        where: { id: reservationId },
        data: { status: 'REJECTED' },
      }),
      this.prisma.reservationApproval.create({
        data: {
          reservationId,
          approvedBy: context.userId,
          approvedAt: new Date(),
          status: 'REJECTED',
        },
      }),
    ]);

    return updated as ReservationOutput;
  }
}
