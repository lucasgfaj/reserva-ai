import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CondominiumNotFoundException,
  CondominiumAccessDeniedException,
} from './exceptions';
import {
  CondominiumOutput,
  CondominiumUpdateInput,
} from './interfaces/condominium.interface';

interface ServiceContext {
  role: string;
  condominiumId: string | null;
}

@Injectable()
export class CondominiumsService {
  constructor(private readonly prisma: PrismaService) {}

  async findCurrent(context: ServiceContext): Promise<CondominiumOutput> {
    if (!context.condominiumId) {
      throw new CondominiumAccessDeniedException();
    }

    const condominium = await this.prisma.condominium.findUnique({
      where: { id: context.condominiumId },
    });

    if (!condominium) {
      throw new CondominiumNotFoundException();
    }

    return condominium as CondominiumOutput;
  }

  async update(
    input: CondominiumUpdateInput,
    context: ServiceContext,
  ): Promise<CondominiumOutput> {
    if (!context.condominiumId) {
      throw new CondominiumAccessDeniedException();
    }

    const existing = await this.prisma.condominium.findUnique({
      where: { id: context.condominiumId },
    });

    if (!existing) {
      throw new CondominiumNotFoundException();
    }

    const updated = await this.prisma.condominium.update({
      where: { id: context.condominiumId },
      data: input,
    });

    return updated as CondominiumOutput;
  }
}
