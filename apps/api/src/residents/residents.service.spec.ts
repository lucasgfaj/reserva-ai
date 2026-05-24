import { Test, TestingModule } from '@nestjs/testing';
import { ResidentsService } from './residents.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { CreateResidentInput } from './interfaces/residents.interface';
import { CreateResidentValidator } from './validators/create-resident.validator';
import { Role, Provider, User, Condominium } from '@prisma/client';
import {
  ResidentAccessDeniedException,
  ResidentNotFoundException,
} from '../common/exceptions';

interface MockPrismaTransaction {
  user: { create: jest.Mock; update: jest.Mock };
  resident: { create: jest.Mock };
}

describe('ResidentsService', () => {
  let service: ResidentsService;

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

  let mockPrisma: {
    user: {
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      findMany: jest.Mock;
    };
    resident: { create: jest.Mock; update: jest.Mock };
    $transaction: (
      callback: (tx: MockPrismaTransaction) => Promise<unknown>,
    ) => Promise<unknown>;
  };
  let mockJwt: { signAsync: jest.Mock };

  beforeEach(async () => {
    mockPrisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue(null),
        findFirst: jest.fn().mockResolvedValue(null),
        findMany: jest.fn().mockResolvedValue([mockResidentUser]),
        count: jest.fn().mockResolvedValue(0),
      },
      resident: {
        create: jest.fn().mockResolvedValue({}),
        update: jest.fn().mockResolvedValue({}),
      },
      /* eslint-disable @typescript-eslint/no-unsafe-return */
      /* eslint-disable @typescript-eslint/no-unsafe-call */
      $transaction: jest.fn().mockImplementation((callback) => {
        return callback({
          user: {
            create: jest.fn().mockResolvedValue(mockResidentUser),
            update: jest.fn().mockResolvedValue(mockResidentUser),
          },
          resident: {
            create: jest.fn().mockResolvedValue({}),
          },
        });
      }),
    };

    mockJwt = {
      signAsync: jest.fn().mockResolvedValue('mock-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResidentsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
        CreateResidentValidator,
      ],
    }).compile();

    service = module.get<ResidentsService>(ResidentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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

    it('should throw ForbiddenException when caller is not admin', async () => {
      const nonAdminContext = {
        userId: mockResidentUser.id,
        email: mockResidentUser.email,
        role: Role.RESIDENT,
        condominiumId: mockAdmin.condominiumId!,
      };

      await expect(
        service.createResident(createResidentInput, nonAdminContext),
      ).rejects.toThrow(ResidentAccessDeniedException);
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

      expect(result).toHaveProperty('temporaryPassword');
    });
  });

  describe('listResidents', () => {
    const adminContext = {
      userId: mockAdmin.id,
      email: mockAdmin.email,
      role: mockAdmin.role,
      condominiumId: mockAdmin.condominiumId!,
    };

    it('should return list of residents for admin', async () => {
      mockPrisma.user.findMany = jest
        .fn()
        .mockResolvedValue([mockResidentUser]);

      const result = await service.listResidents(adminContext);

      expect(result).toHaveProperty('residents');
      expect(Array.isArray(result.residents)).toBe(true);
    });

    it('should throw ForbiddenException for non-admin', async () => {
      const nonAdminContext = {
        userId: mockResidentUser.id,
        email: mockResidentUser.email,
        role: mockResidentUser.role,
        condominiumId: mockResidentUser.condominiumId!,
      };

      await expect(service.listResidents(nonAdminContext)).rejects.toThrow(
        ResidentAccessDeniedException,
      );
    });
  });

  describe('getResidentById', () => {
    const adminContext = {
      userId: mockAdmin.id,
      email: mockAdmin.email,
      role: mockAdmin.role,
      condominiumId: mockAdmin.condominiumId!,
    };

    it('should return resident details for valid id', async () => {
      mockPrisma.user.findFirst = jest.fn().mockResolvedValue({
        ...mockResidentUser,
        resident: { id: 'resident-id-uuid', canBook: true },
      });

      const result = await service.getResidentById(
        mockResidentUser.id,
        adminContext,
      );

      expect(result).toHaveProperty('id');
      expect(result.email).toBe(mockResidentUser.email);
    });

    it('should throw NotFoundException for invalid id', async () => {
      mockPrisma.user.findFirst = jest.fn().mockResolvedValue(null);

      await expect(
        service.getResidentById('invalid-id', adminContext),
      ).rejects.toThrow(ResidentNotFoundException);
    });
  });

  describe('updateResidentPermissions', () => {
    const adminContext = {
      userId: mockAdmin.id,
      email: mockAdmin.email,
      role: mockAdmin.role,
      condominiumId: mockAdmin.condominiumId!,
    };

    it('should update canBook permission when resident exists', async () => {
      mockPrisma.user.findFirst = jest.fn().mockResolvedValue({
        ...mockResidentUser,
        resident: { id: 'resident-id-uuid', canBook: true },
      });

      const result = await service.updateResidentPermissions(
        mockResidentUser.id,
        false,
        adminContext,
      );

      expect(result).toHaveProperty('canBook');
    });

    it('should create resident record when resident does not exist', async () => {
      mockPrisma.user.findFirst = jest.fn().mockResolvedValue({
        ...mockResidentUser,
        resident: null,
      });
      mockPrisma.resident.create = jest.fn().mockResolvedValue({
        id: 'new-resident-id',
        userId: mockResidentUser.id,
        canBook: true,
      });

      const result = await service.updateResidentPermissions(
        mockResidentUser.id,
        true,
        adminContext,
      );

      expect(mockPrisma.resident.create).toHaveBeenCalled();
      expect(result).toHaveProperty('canBook');
    });

    it('should throw ForbiddenException for non-admin', async () => {
      const nonAdminContext = {
        userId: mockResidentUser.id,
        email: mockResidentUser.email,
        role: mockResidentUser.role,
        condominiumId: mockResidentUser.condominiumId!,
      };

      await expect(
        service.updateResidentPermissions(
          mockResidentUser.id,
          false,
          nonAdminContext,
        ),
      ).rejects.toThrow(ResidentAccessDeniedException);
    });
  });
});
