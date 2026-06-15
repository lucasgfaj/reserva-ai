import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import {
  UnitOutput,
  UnitListOutput,
  UnitCreatedOutput,
  UnitUpdatedOutput,
  UnitDeletedOutput,
} from './interfaces/units.interface';
import {
  UnitNotFoundException,
  UnitAccessDeniedException,
  UnitNumberConflictException,
  BlockNotFoundException,
  UnitHasResidentsException,
} from './exceptions/unit.exceptions';

interface ServiceContext {
  role: string;
  condominiumId: string | null;
  userId: string;
  page?: number;
  limit?: number;
  blockId?: string;
}

@Injectable()
export class UnitsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(context: ServiceContext): Promise<UnitListOutput> {
    const page = context.page ?? 1;
    const limit = context.limit ?? 10;
    const skip = (page - 1) * limit;
    const condominiumId = context.condominiumId as string;

    const where: any = { block: { condominiumId } };
    if (context.blockId) {
      where.blockId = context.blockId;
    }

    const [units, total] = await Promise.all([
      this.prisma.unit.findMany({
        where,
        include: { block: { select: { id: true, name: true } } },
        orderBy: { number: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.unit.count({ where }),
    ]);

    return {
      units: units.map((unit) => ({
        id: unit.id,
        number: unit.number,
        blockId: unit.blockId,
        blockName: unit.block.name,
        createdAt: unit.createdAt,
        updatedAt: unit.updatedAt,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getById(id: string, context: ServiceContext): Promise<UnitOutput> {
    const condominiumId = context.condominiumId as string;

    const unit = await this.prisma.unit.findFirst({
      where: { id, block: { condominiumId } },
      include: { block: { select: { id: true, name: true } } },
    });

    if (!unit) {
      throw new UnitNotFoundException(id);
    }

    return {
      id: unit.id,
      number: unit.number,
      blockId: unit.blockId,
      blockName: unit.block.name,
      createdAt: unit.createdAt,
      updatedAt: unit.updatedAt,
    };
  }

  async create(dto: CreateUnitDto, context: ServiceContext): Promise<UnitCreatedOutput> {
    if (context.role !== Role.ADMIN) {
      throw new UnitAccessDeniedException('criar');
    }

    const condominiumId = context.condominiumId as string;

    const block = await this.prisma.block.findFirst({
      where: { id: dto.blockId, condominiumId },
    });

    if (!block) {
      throw new BlockNotFoundException(dto.blockId);
    }

    const existing = await this.prisma.unit.findFirst({
      where: { number: dto.number },
    });

    if (existing) {
      throw new UnitNumberConflictException(dto.number);
    }

    const unit = await this.prisma.unit.create({
      data: {
        number: dto.number,
        blockId: dto.blockId,
      },
    });

    return {
      id: unit.id,
      number: unit.number,
      blockId: unit.blockId,
      createdAt: unit.createdAt,
    };
  }

  async update(id: string, dto: UpdateUnitDto, context: ServiceContext): Promise<UnitUpdatedOutput> {
    if (context.role !== Role.ADMIN) {
      throw new UnitAccessDeniedException('atualizar');
    }

    const condominiumId = context.condominiumId as string;

    const unit = await this.prisma.unit.findFirst({
      where: { id, block: { condominiumId } },
    });

    if (!unit) {
      throw new UnitNotFoundException(id);
    }

    if (dto.blockId) {
      const block = await this.prisma.block.findFirst({
        where: { id: dto.blockId, condominiumId },
      });

      if (!block) {
        throw new BlockNotFoundException(dto.blockId);
      }
    }

    if (dto.number && dto.number !== unit.number) {
      const existing = await this.prisma.unit.findFirst({
        where: { number: dto.number },
      });

      if (existing) {
        throw new UnitNumberConflictException(dto.number);
      }
    }

    const updated = await this.prisma.unit.update({
      where: { id },
      data: {
        ...(dto.number && { number: dto.number }),
        ...(dto.blockId && { blockId: dto.blockId }),
      },
    });

    return {
      id: updated.id,
      number: updated.number,
      blockId: updated.blockId,
      updatedAt: updated.updatedAt,
    };
  }

  async delete(id: string, context: ServiceContext): Promise<UnitDeletedOutput> {
    if (context.role !== Role.ADMIN) {
      throw new UnitAccessDeniedException('remover');
    }

    const condominiumId = context.condominiumId as string;

    const unit = await this.prisma.unit.findFirst({
      where: { id, block: { condominiumId } },
    });

    if (!unit) {
      throw new UnitNotFoundException(id);
    }

    const residentsCount = await this.prisma.resident.count({
      where: { unitId: id },
    });

    if (residentsCount > 0) {
      throw new UnitHasResidentsException(id);
    }

    await this.prisma.unit.delete({ where: { id } });

    return { message: 'Unidade removida com sucesso.' };
  }
}
