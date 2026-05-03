import {
  Injectable,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import {
  RegisterTenantInput,
  RegisterTenantOutput,
  AuthPayload,
  LoginInput,
  LoginOutput,
  CreateResidentInput,
  CreateResidentOutput,
  ResidentListOutput,
  ResidentListItem,
  ResidentDetailOutput,
  UpdateResidentPermissionsOutput,
} from './interfaces/auth.interface';
import { RegisterTenantValidator } from './validators/register-tenant.validator';
import { LoginValidator } from './validators/login.validator';
import { CreateResidentValidator } from './validators/create-resident.validator';
import { Provider, Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly registerValidator: RegisterTenantValidator,
    private readonly loginValidator: LoginValidator,
    private readonly createResidentValidator: CreateResidentValidator,
  ) {}

  async registerTenant(
    input: RegisterTenantInput,
  ): Promise<RegisterTenantOutput> {
    const validation = this.registerValidator.validate(input);
    if (!validation.isValid) {
      throw new BadRequestException(validation.errors);
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: input.adminEmail },
    });

    if (existingUser) {
      throw new ConflictException('Usuário com este email já existe');
    }

    const hashedPassword = await bcrypt.hash(input.adminPassword, 10);

    const transactionResult = await this.prisma.$transaction(async (prisma) => {
      const condominium = await prisma.condominium.create({
        data: {
          name: input.condominiumName,
          address: input.condominiumAddress,
          timezone: 'America/Sao_Paulo',
        },
      });

      const admin = await prisma.user.create({
        data: {
          name: input.adminName,
          email: input.adminEmail,
          passwordHash: hashedPassword,
          provider: Provider.LOCAL,
          role: Role.ADMIN,
          condominiumId: condominium.id,
          isActive: true,
        },
      });

      return { condominium, admin };
    });

    const payload: AuthPayload = {
      sub: transactionResult.admin.id,
      email: transactionResult.admin.email,
      role: transactionResult.admin.role,
      condominiumId: transactionResult.admin.condominiumId ?? '',
    };

    return {
      message: 'Registro realizado com sucesso',
      accessToken: await this.jwtService.signAsync(payload),
      user: {
        id: transactionResult.admin.id,
        name: transactionResult.admin.name,
        email: transactionResult.admin.email,
        role: transactionResult.admin.role,
      },
      condominium: {
        id: transactionResult.condominium.id,
        name: transactionResult.condominium.name,
      },
    };
  }

  async login(input: LoginInput): Promise<LoginOutput> {
    const validation = this.loginValidator.validate(input);
    if (!validation.isValid) {
      throw new BadRequestException(validation.errors);
    }

    const user = await this.prisma.user.findUnique({
      where: { email: input.email },
      include: { condominium: true },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isPasswordValid = await bcrypt.compare(
      input.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload: AuthPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      condominiumId: user.condominiumId ?? '',
    };

    return {
      message: 'Login realizado com sucesso',
      accessToken: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      condominium: {
        id: user.condominium?.id ?? '',
        name: user.condominium?.name ?? '',
      },
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
      throw new BadRequestException(validation.errors);
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new ConflictException('Usuário com este email já existe');
    }

    const password =
      input.password ||
      this.createResidentValidator.generateTemporaryPassword();
    const hashedPassword = await bcrypt.hash(password, 10);

    const canBook = input.canBook !== undefined ? input.canBook : true;

    const transactionResult = await this.prisma.$transaction(async (prisma) => {
      const user = await prisma.user.create({
        data: {
          name: input.name,
          email: input.email,
          passwordHash: hashedPassword,
          provider: Provider.LOCAL,
          role: Role.RESIDENT,
          condominiumId: context.condominiumId,
          isActive: true,
        },
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

    const payload: AuthPayload = {
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
