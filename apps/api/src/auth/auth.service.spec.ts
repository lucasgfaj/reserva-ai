import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException } from '@nestjs/common';
import { RegisterTenantDto } from './dto/register-tenant.dto';
import { Role, Provider } from '@prisma/client';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const mockCondominium = {
    id: 'condominium-id-uuid',
    name: 'Residencial Horizonte',
    address: 'Rua das Flores, 123',
    timezone: 'America/Sao_Paulo',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAdmin = {
    id: 'admin-id-uuid',
    name: 'Lucas Admin',
    email: 'admin@reservaai.com.br',
    passwordHash: 'hashed_password',
    provider: Provider.LOCAL,
    role: Role.ADMIN,
    condominiumId: mockCondominium.id,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const registerDto: RegisterTenantDto = {
    condominiumName: 'Residencial Horizonte',
    condominiumAddress: 'Rua das Flores, 123',
    adminName: 'Lucas Admin',
    adminEmail: 'admin@reservaai.com.br',
    adminPassword: 'SenhaSegura123',
  };

  beforeEach(async () => {
    const mockPrisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
      $transaction: jest.fn().mockImplementation(async (callback: any) => {
        return callback({
          condominium: { create: jest.fn().mockResolvedValue(mockCondominium) },
          user: { create: jest.fn().mockResolvedValue(mockAdmin) },
        });
      }),
    } as any;

    const mockJwt = {
      signAsync: jest.fn().mockResolvedValue('mock-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('registerTenant', () => {
    it('should throw ConflictException when email already exists', async () => {
      prisma.user.findUnique = jest.fn().mockResolvedValue({
        id: 'existing-user-id',
        email: 'admin@reservaai.com.br',
      });

      await expect(service.registerTenant(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should create condominium and admin user successfully', async () => {
      prisma.user.findUnique = jest.fn().mockResolvedValue(null);

      const result = await service.registerTenant(registerDto);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerDto.adminEmail },
      });
      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('condominium');
      expect(result.user.email).toBe(registerDto.adminEmail);
      expect(result.user.role).toBe(Role.ADMIN);
      expect(result.condominium.name).toBe(registerDto.condominiumName);
    });

    it('should generate JWT token with correct payload', async () => {
      prisma.user.findUnique = jest.fn().mockResolvedValue(null);

      await service.registerTenant(registerDto);

      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: mockAdmin.id,
        email: mockAdmin.email,
        role: mockAdmin.role,
        condominiumId: mockAdmin.condominiumId,
      });
    });
  });
});