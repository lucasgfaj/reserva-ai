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
}
