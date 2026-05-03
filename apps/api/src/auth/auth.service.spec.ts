import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import {
  ConflictException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import {
  RegisterTenantInput,
  LoginInput,
  CreateResidentInput,
} from './interfaces/auth.interface';
import { RegisterTenantValidator } from './validators/register-tenant.validator';
import { LoginValidator } from './validators/login.validator';
import { CreateResidentValidator } from './validators/create-resident.validator';
import { Role, Provider, User, Condominium } from '@prisma/client';
import * as bcrypt from 'bcrypt';

interface MockPrismaTransaction {
  condominium: { create: jest.Mock };
  user: { create: jest.Mock };
  resident: { create: jest.Mock };
}

describe('AuthService', () => {
  let service: AuthService;

  const mockCondominium: Condominium = {
    id: 'condominium-id-uuid',
    name: 'Residencial Horizonte',
    address: 'Rua das Flores, 123',
    timezone: 'America/Sao_Paulo',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAdmin: User = {
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

  const mockResidentUser: User = {
    id: 'resident-user-id-uuid',
    name: 'João Morador',
    email: 'joao@reservaai.com.br',
    passwordHash: 'hashed_resident_password',
    provider: Provider.LOCAL,
    role: Role.RESIDENT,
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

  let mockPrisma: {
    user: { findUnique: jest.Mock };
    condominium: { findUnique: jest.Mock };
    $transaction: (
      callback: (tx: MockPrismaTransaction) => Promise<unknown>,
    ) => Promise<unknown>;
  };
  let mockJwt: { signAsync: jest.Mock };

  beforeEach(async () => {
    mockPrisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
      condominium: {
        findUnique: jest.fn().mockResolvedValue(mockCondominium),
      },
      $transaction: jest
        .fn()
        .mockImplementation(
          async (callback: (tx: MockPrismaTransaction) => Promise<unknown>) => {
            const isResidentCall = callback
              .toString()
              .includes('Role.RESIDENT');
            return callback({
              condominium: {
                create: jest.fn().mockResolvedValue(mockCondominium),
              },
              user: {
                create: jest.fn().mockImplementation(() => {
                  if (isResidentCall) {
                    return Promise.resolve(mockResidentUser);
                  }
                  return Promise.resolve(mockAdmin);
                }),
              },
              resident: {
                create: jest.fn().mockResolvedValue({}),
              },
            });
          },
        ),
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
        CreateResidentValidator,
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
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
      expect(result).toHaveProperty('message');
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

      expect(result).toHaveProperty('message');
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

  describe('createResident', () => {
    const createResidentInput: CreateResidentInput = {
      name: 'João Morador',
      email: 'joao@reservaai.com.br',
      canBook: true,
    };

    const adminContext = {
      userId: mockAdmin.id,
      email: mockAdmin.email,
      role: mockAdmin.role,
      condominiumId: mockAdmin.condominiumId!,
    };

    it('should throw BadRequestException for invalid input', async () => {
      const invalidInput: CreateResidentInput = {
        name: '',
        email: 'invalid-email',
      };

      await expect(
        service.createResident(invalidInput, adminContext),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException when email already exists', async () => {
      mockPrisma.user.findUnique = jest.fn().mockResolvedValue({
        id: 'existing-user-id',
        email: 'joao@reservaai.com.br',
      });

      await expect(
        service.createResident(createResidentInput, adminContext),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ForbiddenException when caller is not admin', async () => {
      const nonAdminContext = {
        userId: mockResidentUser.id,
        email: mockResidentUser.email,
        role: Role.RESIDENT,
        condominiumId: mockAdmin.condominiumId!,
      };

      await expect(
        service.createResident(createResidentInput, nonAdminContext),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should create resident user successfully', async () => {
      mockPrisma.user.findUnique = jest.fn().mockResolvedValue(null);

      const result = await service.createResident(
        createResidentInput,
        adminContext,
      );

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(createResidentInput.email);
      expect(result.user.role).toBe(Role.RESIDENT);
    });

    it('should generate temporary password when not provided', async () => {
      mockPrisma.user.findUnique = jest.fn().mockResolvedValue(null);

      const result = await service.createResident(
        createResidentInput,
        adminContext,
      );

      expect(result).toHaveProperty('accessToken');
    });

    it('should use provided password when given', async () => {
      mockPrisma.user.findUnique = jest.fn().mockResolvedValue(null);
      const inputWithPassword = {
        ...createResidentInput,
        password: 'Test1234',
      };

      const result = await service.createResident(
        inputWithPassword,
        adminContext,
      );

      expect(result).toHaveProperty('accessToken');
    });
  });
});
