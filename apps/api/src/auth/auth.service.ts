import {
  Injectable,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
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
} from './interfaces/auth.interface';
import { RegisterTenantValidator } from './validators/register-tenant.validator';
import { LoginValidator } from './validators/login.validator';
import { Provider, Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly registerValidator: RegisterTenantValidator,
    private readonly loginValidator: LoginValidator,
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

  async updateProfile(
    userId: string,
    data: { name?: string; email?: string },
  ): Promise<{ id: string; name: string; email: string; role: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado.');
    }

    if (data.email && data.email !== user.email) {
      const existing = await this.prisma.user.findUnique({
        where: { email: data.email },
      });
      if (existing) {
        throw new ConflictException('Este e-mail já está em uso.');
      }
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.email !== undefined && { email: data.email }),
      },
    });

    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
    };
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Usuário não encontrado.');
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new BadRequestException('Senha atual incorreta.');
    }

    const newHash = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    return { message: 'Senha alterada com sucesso.' };
  }
}
