import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterTenantInput, RegisterTenantOutput, AuthPayload } from './interfaces/auth.interface';
import { RegisterTenantValidator, ValidationResult } from './validators/register-tenant.validator';
import { Provider, Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly validator: RegisterTenantValidator,
  ) { }

  async registerTenant(input: RegisterTenantInput): Promise<RegisterTenantOutput> {
    const validation = this.validator.validate(input);
    if (!validation.isValid) {
      throw new BadRequestException(validation.errors);
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: input.adminEmail },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
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
      condominiumId: transactionResult.admin.condominiumId ?? ''
    };

    return {
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
      }
    };
  }
}