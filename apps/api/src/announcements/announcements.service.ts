import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import {
  AnnouncementOutput,
  AnnouncementListOutput,
  AnnouncementCreatedOutput,
} from './interfaces/announcement.interface';

interface ServiceContext {
  role: string;
  condominiumId: string | null;
  userId: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class AnnouncementsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreateAnnouncementDto,
    context: ServiceContext,
  ): Promise<AnnouncementCreatedOutput> {
    if (context.role !== Role.ADMIN) {
      throw new Error('Apenas administradores podem criar comunicados.');
    }

    const announcement = await this.prisma.announcement.create({
      data: {
        title: dto.title,
        content: dto.content,
        condominiumId: context.condominiumId as string,
        authorId: context.userId,
      },
    });

    return {
      id: announcement.id,
      title: announcement.title,
      content: announcement.content,
      createdAt: announcement.createdAt,
    };
  }

  async list(context: ServiceContext): Promise<AnnouncementListOutput> {
    const page = context.page ?? 1;
    const limit = context.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = {
      condominiumId: context.condominiumId as string,
      isActive: true,
    };

    const [announcements, total] = await Promise.all([
      this.prisma.announcement.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          author: { select: { name: true } },
        },
      }),
      this.prisma.announcement.count({ where }),
    ]);

    return {
      announcements: announcements.map((a) => ({
        id: a.id,
        title: a.title,
        content: a.content,
        condominiumId: a.condominiumId,
        authorId: a.authorId,
        authorName: a.author.name,
        isActive: a.isActive,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async delete(
    id: string,
    context: ServiceContext,
  ): Promise<{ message: string }> {
    if (context.role !== Role.ADMIN) {
      throw new Error('Apenas administradores podem remover comunicados.');
    }

    const announcement = await this.prisma.announcement.findFirst({
      where: { id, condominiumId: context.condominiumId as string },
    });

    if (!announcement) {
      throw new Error('Comunicado não encontrado.');
    }

    await this.prisma.announcement.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'Comunicado removido com sucesso.' };
  }
}
