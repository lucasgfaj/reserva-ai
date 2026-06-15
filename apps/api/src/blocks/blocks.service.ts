import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlockDto } from './dto/create-block.dto';
import { UpdateBlockDto } from './dto/update-block.dto';
import {
  BlockOutput,
  BlockListOutput,
  BlockCreatedOutput,
  BlockUpdatedOutput,
  BlockDeletedOutput,
} from './interfaces/blocks.interface';
import {
  BlockNotFoundException,
  BlockAccessDeniedException,
  BlockNameConflictException,
  BlockHasUnitsException,
} from './exceptions/block.exceptions';

interface ServiceContext {
  role: string;
  condominiumId: string | null;
  userId: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class BlocksService {
  constructor(private readonly prisma: PrismaService) {}

  async list(context: ServiceContext): Promise<BlockListOutput> {
    const page = context.page ?? 1;
    const limit = context.limit ?? 10;
    const skip = (page - 1) * limit;
    const condominiumId = context.condominiumId as string;

    const where = { condominiumId };

    const [blocks, total] = await Promise.all([
      this.prisma.block.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.block.count({ where }),
    ]);

    return {
      blocks,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getById(id: string, context: ServiceContext): Promise<BlockOutput> {
    const condominiumId = context.condominiumId as string;

    const block = await this.prisma.block.findFirst({
      where: { id, condominiumId },
    });

    if (!block) {
      throw new BlockNotFoundException(id);
    }

    return block;
  }

  async create(dto: CreateBlockDto, context: ServiceContext): Promise<BlockCreatedOutput> {
    if (context.role !== Role.ADMIN) {
      throw new BlockAccessDeniedException('criar');
    }

    const condominiumId = context.condominiumId as string;

    const existing = await this.prisma.block.findFirst({
      where: { name: dto.name, condominiumId },
    });

    if (existing) {
      throw new BlockNameConflictException(dto.name);
    }

    const block = await this.prisma.block.create({
      data: {
        name: dto.name,
        condominiumId,
      },
    });

    return {
      id: block.id,
      name: block.name,
      condominiumId: block.condominiumId,
      createdAt: block.createdAt,
    };
  }

  async update(id: string, dto: UpdateBlockDto, context: ServiceContext): Promise<BlockUpdatedOutput> {
    if (context.role !== Role.ADMIN) {
      throw new BlockAccessDeniedException('atualizar');
    }

    const condominiumId = context.condominiumId as string;

    const block = await this.prisma.block.findFirst({
      where: { id, condominiumId },
    });

    if (!block) {
      throw new BlockNotFoundException(id);
    }

    if (dto.name && dto.name !== block.name) {
      const existing = await this.prisma.block.findFirst({
        where: { name: dto.name, condominiumId },
      });

      if (existing) {
        throw new BlockNameConflictException(dto.name);
      }
    }

    const updated = await this.prisma.block.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
      },
    });

    return {
      id: updated.id,
      name: updated.name,
      condominiumId: updated.condominiumId,
      updatedAt: updated.updatedAt,
    };
  }

  async delete(id: string, context: ServiceContext): Promise<BlockDeletedOutput> {
    if (context.role !== Role.ADMIN) {
      throw new BlockAccessDeniedException('remover');
    }

    const condominiumId = context.condominiumId as string;

    const block = await this.prisma.block.findFirst({
      where: { id, condominiumId },
    });

    if (!block) {
      throw new BlockNotFoundException(id);
    }

    const unitsCount = await this.prisma.unit.count({
      where: { blockId: id },
    });

    if (unitsCount > 0) {
      throw new BlockHasUnitsException(id);
    }

    await this.prisma.block.delete({ where: { id } });

    return { message: 'Bloco removido com sucesso.' };
  }
}
