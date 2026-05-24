import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import { CreateCommonAreaValidator } from './validators/create-common-area.validator';
import {
  CommonAreaNotFoundException,
  CommonAreaAccessDeniedException,
  TenantAccessDeniedException,
  CommonAreaValidationException,
  CommonAreaNameConflictException,
  CommonAreaHasReservationsException,
} from './exceptions';
import {
  CommonAreaListOutput,
  CommonAreaDetailOutput,
  CommonAreaCreatedOutput,
  CommonAreaUpdatedOutput,
  CommonAreaDeletedOutput,
  CreateCommonAreaInput,
  UpdateCommonAreaInput,
  CheckAvailabilityInput,
  AvailabilityOutput,
  BusyDaysOutput,
} from './interfaces/common-areas.interface';

interface ServiceContext {
  role: string;
  condominiumId: string | null;
  userId: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class CommonAreasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createValidator: CreateCommonAreaValidator,
  ) {}

  async listCommonAreas(context: ServiceContext): Promise<CommonAreaListOutput> {
    this.validateAccess(context);

    const page = context.page ?? 1;
    const limit = context.limit ?? 10;
    const skip = (page - 1) * limit;

    const [commonAreas, total] = await Promise.all([
      this.prisma.commonArea.findMany({
        where: { condominiumId: context.condominiumId as string },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.commonArea.count({
        where: { condominiumId: context.condominiumId as string },
      }),
    ]);

    return {
      commonAreas: commonAreas as CommonAreaListOutput['commonAreas'],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getCommonAreaById(
    areaId: string,
    context: ServiceContext,
  ): Promise<CommonAreaDetailOutput> {
    this.validateAccess(context);

    const commonArea = await this.prisma.commonArea.findFirst({
      where: { id: areaId },
    });

    if (!commonArea) {
      throw new CommonAreaNotFoundException(areaId);
    }

    this.validateTenantAccess(commonArea.condominiumId, context.condominiumId);

    return commonArea as CommonAreaDetailOutput;
  }

  async createCommonArea(
    input: CreateCommonAreaInput,
    context: ServiceContext,
  ): Promise<CommonAreaCreatedOutput> {
    if (context.role !== Role.ADMIN) {
      throw new CommonAreaAccessDeniedException('cadastrar');
    }

    const validation = this.createValidator.validate(input);
    if (!validation.isValid) {
      throw new CommonAreaValidationException(validation.errors);
    }

    const existingArea = await this.prisma.commonArea.findFirst({
      where: {
        condominiumId: context.condominiumId as string,
        name: input.name,
      },
    });

    if (existingArea) {
      throw new CommonAreaNameConflictException(input.name);
    }

    const commonArea = await this.prisma.commonArea.create({
      data: {
        name: input.name,
        description: input.description,
        capacity: input.capacity,
        openTime: input.openTime,
        closeTime: input.closeTime,
        operatingDays: input.operatingDays,
        requiresApproval: input.requiresApproval ?? false,
        icon: input.icon,
        isUnderMaintenance: input.isUnderMaintenance ?? false,
        condominiumId: context.condominiumId as string,
      },
    });

    return commonArea as unknown as CommonAreaCreatedOutput;
  }

  async updateCommonArea(
    areaId: string,
    input: UpdateCommonAreaInput,
    context: ServiceContext,
  ): Promise<CommonAreaUpdatedOutput> {
    if (context.role !== Role.ADMIN) {
      throw new CommonAreaAccessDeniedException('atualizar');
    }

    const existingArea = await this.prisma.commonArea.findFirst({
      where: { id: areaId },
    });

    if (!existingArea) {
      throw new CommonAreaNotFoundException(areaId);
    }

    this.validateTenantAccess(existingArea.condominiumId, context.condominiumId);

    if (input.name && input.name !== existingArea.name) {
      const areaWithSameName = await this.prisma.commonArea.findFirst({
        where: {
          condominiumId: context.condominiumId as string,
          name: input.name,
          id: { not: areaId },
        },
      });

      if (areaWithSameName) {
        throw new CommonAreaNameConflictException(input.name);
      }
    }

    const updatedArea = await this.prisma.commonArea.update({
      where: { id: areaId },
      data: input,
    });

    return updatedArea as unknown as CommonAreaUpdatedOutput;
  }

  async deleteCommonArea(
    areaId: string,
    context: ServiceContext,
  ): Promise<CommonAreaDeletedOutput> {
    if (context.role !== Role.ADMIN) {
      throw new CommonAreaAccessDeniedException('deletar');
    }

    const existingArea = await this.prisma.commonArea.findFirst({
      where: { id: areaId },
    });

    if (!existingArea) {
      throw new CommonAreaNotFoundException(areaId);
    }

    this.validateTenantAccess(existingArea.condominiumId, context.condominiumId);

    const activeReservations = await this.prisma.reservation.count({
      where: {
        commonAreaId: areaId,
        status: { in: ['PENDING', 'APPROVED'] },
      },
    });

    if (activeReservations > 0) {
      throw new CommonAreaHasReservationsException(areaId, activeReservations);
    }

    await this.prisma.commonArea.delete({ where: { id: areaId } });

    return {
      message: 'Área comum deletada com sucesso',
      id: areaId,
    };
  }

  async getBusyDays(
    areaId: string,
    year: number,
    month: number,
    context: ServiceContext,
  ): Promise<BusyDaysOutput> {
    this.validateAccess(context);

    const commonArea = await this.prisma.commonArea.findFirst({
      where: { id: areaId },
    });

    if (!commonArea) {
      throw new CommonAreaNotFoundException(areaId);
    }

    this.validateTenantAccess(commonArea.condominiumId, context.condominiumId);

    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    const reservations = await this.prisma.reservation.findMany({
      where: {
        commonAreaId: areaId,
        status: { in: ['PENDING', 'APPROVED'] },
        startTime: { lte: endDate },
        endTime: { gte: startDate },
      },
      select: { startTime: true, endTime: true },
    });

    const busySet = new Set<string>()

    for (const r of reservations) {
      const startDate = new Date(r.startTime).toISOString().split('T')[0]
      const endDate = new Date(r.endTime).toISOString().split('T')[0]
      const current = new Date(startDate + 'T12:00:00Z')
      const end = new Date(endDate + 'T12:00:00Z')

      while (current <= end) {
        busySet.add(current.toISOString().split('T')[0])
        current.setUTCDate(current.getUTCDate() + 1)
      }
    }

    const closedDates = this.getClosedDates(commonArea.closedDates);
    for (const d of closedDates) {
      const dt = new Date(d + 'T12:00:00Z');
      if (dt >= startDate && dt <= endDate) {
        busySet.add(d);
      }
    }

    return {
      commonAreaId: areaId,
      year,
      month,
      busyDates: Array.from(busySet).sort(),
    };
  }

  async checkAvailability(
    areaId: string,
    input: CheckAvailabilityInput,
    context: ServiceContext,
  ): Promise<AvailabilityOutput> {
    this.validateAccess(context);

    const commonArea = await this.prisma.commonArea.findFirst({
      where: { id: areaId },
    });

    if (!commonArea) {
      throw new CommonAreaNotFoundException(areaId);
    }

    this.validateTenantAccess(commonArea.condominiumId, context.condominiumId);

    if (commonArea.isUnderMaintenance) {
      throw new CommonAreaValidationException([
        'Esta área comum está em manutenção e não disponível para reservas.',
      ]);
    }

    const requestedDate = new Date(input.date + 'T12:00:00Z');
    const dayOfWeek = ((requestedDate.getUTCDay() + 6) % 7) + 1;

    const operatingDays: number[] = typeof commonArea.operatingDays === 'string'
      ? commonArea.operatingDays.split(',').map(Number)
      : Array.isArray(commonArea.operatingDays)
        ? commonArea.operatingDays.map(Number)
        : [];

    const normalized = operatingDays.map((d) => (d === 0 ? 7 : d));

    if (!normalized.includes(dayOfWeek)) {
      throw new CommonAreaValidationException([
        `Esta área não funciona no dia solicitado (dia da semana ${dayOfWeek}).`,
      ]);
    }

    const closedDates = this.getClosedDates(commonArea.closedDates);
    if (closedDates.includes(input.date)) {
      throw new CommonAreaValidationException([
        'Esta área está fechada na data solicitada.',
      ]);
    }

    const startTime = input.startTime ?? commonArea.openTime;
    const endTime = input.endTime ?? commonArea.closeTime;

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

    const startDateTime = new Date(`${input.date}T${startTime}:00.000Z`);
    const endDateTime = new Date(`${input.date}T${endTime}:00.000Z`);

    const conflicts = await this.prisma.reservation.findMany({
      where: {
        commonAreaId: areaId,
        status: { in: ['PENDING', 'APPROVED'] },
        startTime: { lt: endDateTime },
        endTime: { gt: startDateTime },
      },
      select: {
        startTime: true,
        endTime: true,
        status: true,
      },
      orderBy: { startTime: 'asc' },
    });

    const formatTime = (dt: Date) =>
      `${String(dt.getUTCHours()).padStart(2, '0')}:${String(dt.getUTCMinutes()).padStart(2, '0')}`;

    return {
      available: conflicts.length === 0,
      date: input.date,
      commonAreaId: commonArea.id,
      commonAreaName: commonArea.name,
      openTime: commonArea.openTime,
      closeTime: commonArea.closeTime,
      startTime: input.startTime,
      endTime: input.endTime,
      conflicts: conflicts.map((c) => ({
        startTime: formatTime(c.startTime),
        endTime: formatTime(c.endTime),
        status: c.status,
      })),
    };
  }

  private getClosedDates(closedDates: any): string[] {
    if (Array.isArray(closedDates)) {
      return closedDates.map(String);
    }
    return [];
  }

  async addClosedDate(
    areaId: string,
    date: string,
    context: ServiceContext,
  ): Promise<CommonAreaUpdatedOutput> {
    if (context.role !== Role.ADMIN) {
      throw new CommonAreaAccessDeniedException('fechar data');
    }

    const commonArea = await this.prisma.commonArea.findFirst({
      where: { id: areaId },
    });

    if (!commonArea) {
      throw new CommonAreaNotFoundException(areaId);
    }

    this.validateTenantAccess(commonArea.condominiumId, context.condominiumId);

    const current = this.getClosedDates(commonArea.closedDates);
    if (!current.includes(date)) {
      current.push(date);
    }

    const updated = await this.prisma.commonArea.update({
      where: { id: areaId },
      data: { closedDates: current },
    });

    return updated as unknown as CommonAreaUpdatedOutput;
  }

  async removeClosedDate(
    areaId: string,
    date: string,
    context: ServiceContext,
  ): Promise<CommonAreaUpdatedOutput> {
    if (context.role !== Role.ADMIN) {
      throw new CommonAreaAccessDeniedException('reabrir data');
    }

    const commonArea = await this.prisma.commonArea.findFirst({
      where: { id: areaId },
    });

    if (!commonArea) {
      throw new CommonAreaNotFoundException(areaId);
    }

    this.validateTenantAccess(commonArea.condominiumId, context.condominiumId);

    const current = this.getClosedDates(commonArea.closedDates).filter((d) => d !== date);

    const updated = await this.prisma.commonArea.update({
      where: { id: areaId },
      data: { closedDates: current },
    });

    return updated as unknown as CommonAreaUpdatedOutput;
  }

  private validateAccess(context: ServiceContext): void {
    if (!context.condominiumId) {
      throw new CommonAreaAccessDeniedException('acessar');
    }

    if (context.role !== Role.ADMIN && context.role !== Role.RESIDENT) {
      throw new CommonAreaAccessDeniedException('acessar');
    }
  }

  private validateTenantAccess(
    resourceCondominiumId: string,
    userCondominiumId: string | null,
  ): void {
    if (resourceCondominiumId !== userCondominiumId) {
      throw new TenantAccessDeniedException();
    }
  }
}
