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
