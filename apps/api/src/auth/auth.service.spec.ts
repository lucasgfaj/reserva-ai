import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import {
  ConflictException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterTenantInput, LoginInput } from './interfaces/auth.interface';
import { RegisterTenantValidator } from './validators/register-tenant.validator';
import { LoginValidator } from './validators/login.validator';
import { Role, Provider } from '@prisma/client';
import * as bcrypt from 'bcrypt';

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
  let registerValidator: RegisterTenantValidator;
  let loginValidator: LoginValidator;

  beforeEach(async () => {
    registerValidator = new RegisterTenantValidator();
    loginValidator = new LoginValidator();

    mockPrisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
      condominium: {
        findUnique: jest.fn().mockResolvedValue(mockCondominium),
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
        LoginValidator,
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

  describe('login', () => {
    const loginInput: LoginInput = {
      email: 'admin@reservaai.com.br',
      password: 'Senha123!',
    };

    it('should throw UnauthorizedException when email not found', async () => {
      mockPrisma.user.findUnique = jest.fn().mockResolvedValue(null);

      await expect(service.login(loginInput)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      mockPrisma.user.findUnique = jest.fn().mockResolvedValue({
        ...mockAdmin,
        passwordHash: await bcrypt.hash('correctpassword', 10),
      });

      await expect(service.login(loginInput)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should login successfully and return JWT token', async () => {
      mockPrisma.user.findUnique = jest.fn().mockResolvedValue({
        ...mockAdmin,
        passwordHash: await bcrypt.hash(loginInput.password, 10),
      });

      const result = await service.login(loginInput);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(loginInput.email);
      expect(result.user.role).toBe(Role.ADMIN);
    });

    it('should generate JWT token with correct payload on login', async () => {
      mockPrisma.user.findUnique = jest.fn().mockResolvedValue({
        ...mockAdmin,
        passwordHash: await bcrypt.hash(loginInput.password, 10),
      });

      await service.login(loginInput);

      expect(mockJwt.signAsync).toHaveBeenCalledWith({
        sub: mockAdmin.id,
        email: mockAdmin.email,
        role: mockAdmin.role,
        condominiumId: mockAdmin.condominiumId,
      });
    });
  });
});
