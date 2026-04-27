import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, BadRequestException } from '@nestjs/common';
import { RegisterTenantInput } from './interfaces/auth.interface';
import { RegisterTenantValidator } from './validators/register-tenant.validator';
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

  const registerInput: RegisterTenantInput = {
    condominiumName: 'Residencial Horizonte',
    condominiumAddress: 'Rua das Flores, 123',
    adminName: 'Lucas Admin',
    adminEmail: 'admin@reservaai.com.br',
    adminPassword: 'Senha123!',
  };

  let mockPrisma: any;
  let mockJwt: any;
  let validator: RegisterTenantValidator;

  beforeEach(async () => {
    validator = new RegisterTenantValidator();

    mockPrisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
      $transaction: jest.fn().mockImplementation(async (callback: any) => {
        return callback({
          condominium: { create: jest.fn().mockResolvedValue(mockCondominium) },
          user: { create: jest.fn().mockResolvedValue(mockAdmin) },
        });
      }),
    };

    mockJwt = {
      signAsync: jest.fn().mockResolvedValue('mock-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
        RegisterTenantValidator,
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
    it('should throw BadRequestException for invalid input - missing fields', async () => {
      const invalidInput: RegisterTenantInput = {
        condominiumName: '',
        condominiumAddress: '',
        adminName: '',
        adminEmail: 'invalid-email',
        adminPassword: 'short',
      };

      await expect(service.registerTenant(invalidInput)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ConflictException when email already exists', async () => {
      mockPrisma.user.findUnique = jest.fn().mockResolvedValue({
        id: 'existing-user-id',
        email: 'admin@reservaai.com.br',
      });

      await expect(service.registerTenant(registerInput)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should create condominium and admin user successfully', async () => {
      mockPrisma.user.findUnique = jest.fn().mockResolvedValue(null);

      const result = await service.registerTenant(registerInput);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerInput.adminEmail },
      });
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('condominium');
      expect(result.user.email).toBe(registerInput.adminEmail);
      expect(result.user.role).toBe(Role.ADMIN);
      expect(result.condominium.name).toBe(registerInput.condominiumName);
    });

    it('should generate JWT token with correct payload', async () => {
      mockPrisma.user.findUnique = jest.fn().mockResolvedValue(null);

      await service.registerTenant(registerInput);

      expect(mockJwt.signAsync).toHaveBeenCalledWith({
        sub: mockAdmin.id,
        email: mockAdmin.email,
        role: mockAdmin.role,
        condominiumId: mockAdmin.condominiumId,
      });
    });
  });
});