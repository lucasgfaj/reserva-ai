import { Injectable, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterTenantDto } from './dto/register-tenant.dto';
import { Provider, Role } from '@prisma/client';
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) { }

  async registerTenant(data: RegisterTenantDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.adminEmail },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.adminPassword, 10);

    const transactionResult = await this.prisma.$transaction(async (prisma) => {
      const condominium = await prisma.condominium.create({
        data: {
          name: data.condominiumName,
          address: data.condominiumAddress,
          timezone: 'America/Sao_Paulo',
        },
      });

      const admin = await prisma.user.create({
        data: {
          name: data.adminName,
          email: data.adminEmail,
          passwordHash: hashedPassword,
          provider: Provider.LOCAL,
          role: Role.ADMIN,
          condominiumId: condominium.id,
          isActive: true,
        },
      });

      return { condominium, admin };
    });

    const payload = {
      sub: transactionResult.admin.id,
      email: transactionResult.admin.email,
      role: transactionResult.admin.role,
      condominiumId: transactionResult.admin.condominiumId
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
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
