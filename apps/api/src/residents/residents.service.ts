import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import {
  ResidentListOutput,
  ResidentListItem,
  ResidentDetailOutput,
  UpdateResidentPermissionsOutput,
  CreateResidentOutput,
} from './interfaces/residents.interface';
import { CreateResidentValidator } from './validators/create-resident.validator';

interface CreateResidentInput {
  name: string;
  email: string;
  password?: string;
  unitId?: string;
  document?: string;
  phone?: string;
  canBook?: boolean;
}

@Injectable()
export class ResidentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly createResidentValidator: CreateResidentValidator,
  ) {}

  async listResidents(context: {
    role: string;
    condominiumId: string;
  }): Promise<ResidentListOutput> {
    if (context.role !== Role.ADMIN) {
      throw new ForbiddenException(
        'Apenas administradores podem listar moradores',
      );
    }

    const users = await this.prisma.user.findMany({
      where: {
        condominiumId: context.condominiumId,
        role: Role.RESIDENT,
      },
      include: {
        resident: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const residents: ResidentListItem[] = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      canBook: user.resident?.canBook ?? true,
      document: user.resident?.document ?? undefined,
      phone: user.resident?.phone ?? undefined,
      unitId: user.resident?.unitId ?? undefined,
      createdAt: user.createdAt,
    }));

    return {
      residents,
      total: residents.length,
    };
  }

  async getResidentById(
    residentId: string,
    context: { role: string; condominiumId: string },
  ): Promise<ResidentDetailOutput> {
    if (context.role !== Role.ADMIN) {
      throw new ForbiddenException(
        'Apenas administradores podem buscar moradores',
      );
    }

    const user = await this.prisma.user.findFirst({
      where: {
        id: residentId,
        condominiumId: context.condominiumId,
        role: Role.RESIDENT,
      },
      include: {
        resident: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Morador não encontrado');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      canBook: user.resident?.canBook ?? true,
      document: user.resident?.document ?? undefined,
      phone: user.resident?.phone ?? undefined,
      unitId: user.resident?.unitId ?? undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async createResident(
    input: CreateResidentInput,
    context: {
      userId: string;
      email: string;
      role: string;
      condominiumId: string;
    },
  ): Promise<CreateResidentOutput> {
    if (context.role !== Role.ADMIN) {
      throw new ForbiddenException(
        'Apenas administradores podem cadastrar moradores',
      );
    }

    const validation = this.createResidentValidator.validate(input);
    if (!validation.isValid) {
      throw new ForbiddenException(validation.errors);
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new ForbiddenException('Usuário com este email já existe');
    }

    const password =
      input.password ||
      this.createResidentValidator.generateTemporaryPassword();
    const canBook = input.canBook !== undefined ? input.canBook : true;

    const transactionResult = await this.prisma.$transaction(async (prisma) => {
      const user = await prisma.user.create({
        data: {
          name: input.name,
          email: input.email,
          passwordHash: '', // temporary, will be set below
          provider: 'LOCAL',
          role: Role.RESIDENT,
          condominiumId: context.condominiumId,
          isActive: true,
        },
      });

      const bcrypt = await import('bcrypt');
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: hashedPassword },
      });

      await prisma.resident.create({
        data: {
          userId: user.id,
          unitId: input.unitId || null,
          document: input.document,
          phone: input.phone,
          canBook,
        },
      });

      return user;
    });

    const payload = {
      sub: transactionResult.id,
      email: transactionResult.email,
      role: transactionResult.role,
      condominiumId: context.condominiumId,
    };

    return {
      message: 'Morador cadastrado com sucesso',
      accessToken: await this.jwtService.signAsync(payload),
      temporaryPassword: password,
      user: {
        id: transactionResult.id,
        name: transactionResult.name,
        email: transactionResult.email,
        role: transactionResult.role,
      },
    };
  }

  async updateResidentPermissions(
    residentId: string,
    canBook: boolean,
    context: { role: string; condominiumId: string },
  ): Promise<UpdateResidentPermissionsOutput> {
    if (context.role !== Role.ADMIN) {
      throw new ForbiddenException(
        'Apenas administradores podem alterar permissões',
      );
    }

    const user = await this.prisma.user.findFirst({
      where: {
        id: residentId,
        condominiumId: context.condominiumId,
        role: Role.RESIDENT,
      },
      include: {
        resident: true,
      },
    });

    if (!user || !user.id || user.id === '') {
      throw new NotFoundException('Morador não encontrado');
    }

    const hasResident =
      user.resident && user.resident.id && user.resident.id !== '';

    if (!hasResident) {
      await this.prisma.resident.create({
        data: {
          userId: user.id,
          unitId: null,
          canBook,
        },
      });
    } else if (user.resident) {
      await this.prisma.resident.update({
        where: { id: user.resident.id },
        data: { canBook },
      });
    }

    return {
      message: `Permissão de reserva ${canBook ? 'ativada' : 'desativada'} com sucesso`,
      canBook,
    };
  }
}
