import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UnitsService } from './units.service';
import {
  UnitNotFoundException,
  UnitAccessDeniedException,
  UnitNumberConflictException,
  BlockNotFoundException,
  UnitHasResidentsException,
} from './exceptions/unit.exceptions';

describe('UnitsService', () => {
  let service: UnitsService;
  let prisma: PrismaService;

  const mockCondoId = 'condo-uuid-123';
  const mockBlockId = 'block-uuid-001';
  const mockUserId = 'user-uuid-456';
  const mockContext = { role: Role.ADMIN, condominiumId: mockCondoId, userId: mockUserId };
  const mockResidentContext = { role: Role.RESIDENT, condominiumId: mockCondoId, userId: 'resident-id' };

  const mockUnit = {
    id: 'unit-uuid-001',
    number: '101',
    blockId: mockBlockId,
    block: { id: mockBlockId, name: 'Bloco A' },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockBlock = {
    id: mockBlockId,
    name: 'Bloco A',
    condominiumId: mockCondoId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrisma = {
    unit: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    block: {
      findFirst: jest.fn(),
    },
    resident: {
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnitsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<UnitsService>(UnitsService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('list', () => {
    it('should list units of the condominium with block info', async () => {
      mockPrisma.unit.findMany.mockResolvedValue([mockUnit]);
      mockPrisma.unit.count.mockResolvedValue(1);

      const result = await service.list(mockContext);

      expect(result.units).toHaveLength(1);
      expect(result.units[0].number).toBe('101');
      expect(result.units[0].blockName).toBe('Bloco A');
      expect(result.total).toBe(1);
      expect(mockPrisma.unit.findMany).toHaveBeenCalledWith({
        where: { block: { condominiumId: mockCondoId } },
        include: { block: { select: { id: true, name: true } } },
        orderBy: { number: 'asc' },
        skip: 0,
        take: 10,
      });
    });

    it('should filter units by blockId', async () => {
      mockPrisma.unit.findMany.mockResolvedValue([mockUnit]);
      mockPrisma.unit.count.mockResolvedValue(1);

      const result = await service.list({ ...mockContext, blockId: mockBlockId });

      expect(mockPrisma.unit.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { blockId: mockBlockId, block: { condominiumId: mockCondoId } },
        }),
      );
      expect(result.units).toHaveLength(1);
    });

    it('should return empty list if no units', async () => {
      mockPrisma.unit.findMany.mockResolvedValue([]);
      mockPrisma.unit.count.mockResolvedValue(0);

      const result = await service.list(mockContext);

      expect(result.units).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should allow RESIDENT to list', async () => {
      mockPrisma.unit.findMany.mockResolvedValue([mockUnit]);
      mockPrisma.unit.count.mockResolvedValue(1);

      const result = await service.list(mockResidentContext);

      expect(result.units).toHaveLength(1);
    });
  });

  describe('getById', () => {
    it('should return unit by id', async () => {
      mockPrisma.unit.findFirst.mockResolvedValue(mockUnit);

      const result = await service.getById('unit-uuid-001', mockContext);

      expect(result.number).toBe('101');
    });

    it('should throw UnitNotFoundException if not found', async () => {
      mockPrisma.unit.findFirst.mockResolvedValue(null);

      await expect(service.getById('inexistente', mockContext))
        .rejects.toThrow(UnitNotFoundException);
    });

    it('should allow RESIDENT to get by id', async () => {
      mockPrisma.unit.findFirst.mockResolvedValue(mockUnit);

      const result = await service.getById('unit-uuid-001', mockResidentContext);

      expect(result.number).toBe('101');
    });
  });

  describe('create', () => {
    const createDto = { number: '101', blockId: mockBlockId };

    it('should create a unit', async () => {
      mockPrisma.block.findFirst.mockResolvedValue(mockBlock);
      mockPrisma.unit.findFirst.mockResolvedValue(null);
      mockPrisma.unit.create.mockResolvedValue(mockUnit);

      const result = await service.create(createDto, mockContext);

      expect(result.number).toBe('101');
      expect(result.blockId).toBe(mockBlockId);
      expect(mockPrisma.unit.create).toHaveBeenCalledWith({
        data: { number: '101', blockId: mockBlockId },
      });
    });

    it('should throw UnitAccessDeniedException if not ADMIN', async () => {
      await expect(service.create(createDto, mockResidentContext))
        .rejects.toThrow(UnitAccessDeniedException);
    });

    it('should throw BlockNotFoundException if block does not exist in condominium', async () => {
      mockPrisma.block.findFirst.mockResolvedValue(null);

      await expect(service.create(createDto, mockContext))
        .rejects.toThrow(BlockNotFoundException);
    });

    it('should throw UnitNumberConflictException if number already exists', async () => {
      mockPrisma.block.findFirst.mockResolvedValue(mockBlock);
      mockPrisma.unit.findFirst.mockResolvedValue(mockUnit);

      await expect(service.create(createDto, mockContext))
        .rejects.toThrow(UnitNumberConflictException);
    });
  });

  describe('update', () => {
    const updateDto = { number: '102' };

    it('should update unit number', async () => {
      mockPrisma.unit.findFirst.mockResolvedValue(mockUnit);
      mockPrisma.unit.findFirst.mockResolvedValueOnce(mockUnit);
      mockPrisma.unit.findFirst.mockResolvedValueOnce(null);
      mockPrisma.unit.update.mockResolvedValue({ ...mockUnit, number: '102', updatedAt: new Date() });

      const result = await service.update('unit-uuid-001', updateDto, mockContext);

      expect(result.number).toBe('102');
    });

    it('should throw UnitNotFoundException if not found', async () => {
      mockPrisma.unit.findFirst.mockResolvedValue(null);

      await expect(service.update('inexistente', updateDto, mockContext))
        .rejects.toThrow(UnitNotFoundException);
    });

    it('should throw UnitAccessDeniedException if not ADMIN', async () => {
      await expect(service.update('unit-uuid-001', updateDto, mockResidentContext))
        .rejects.toThrow(UnitAccessDeniedException);
    });

    it('should throw UnitNumberConflictException if new number already exists', async () => {
      const outraUnit = { ...mockUnit, id: 'outra-unit', number: '102' };
      mockPrisma.unit.findFirst
        .mockResolvedValueOnce(mockUnit)
        .mockResolvedValueOnce(outraUnit);

      await expect(service.update('unit-uuid-001', { number: '102' }, mockContext))
        .rejects.toThrow(UnitNumberConflictException);
    });

    it('should validate blockId when updating block', async () => {
      mockPrisma.unit.findFirst.mockResolvedValue(mockUnit);
      mockPrisma.block.findFirst.mockResolvedValue(null);

      await expect(service.update('unit-uuid-001', { blockId: 'block-inexistente' }, mockContext))
        .rejects.toThrow(BlockNotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete unit if it has no residents', async () => {
      mockPrisma.unit.findFirst.mockResolvedValue(mockUnit);
      mockPrisma.resident.count.mockResolvedValue(0);
      mockPrisma.unit.delete.mockResolvedValue(mockUnit);

      const result = await service.delete('unit-uuid-001', mockContext);

      expect(result.message).toBe('Unidade removida com sucesso.');
    });

    it('should throw UnitNotFoundException if not found', async () => {
      mockPrisma.unit.findFirst.mockResolvedValue(null);

      await expect(service.delete('inexistente', mockContext))
        .rejects.toThrow(UnitNotFoundException);
    });

    it('should throw UnitAccessDeniedException if not ADMIN', async () => {
      await expect(service.delete('unit-uuid-001', mockResidentContext))
        .rejects.toThrow(UnitAccessDeniedException);
    });

    it('should throw UnitHasResidentsException if unit has residents', async () => {
      mockPrisma.unit.findFirst.mockResolvedValue(mockUnit);
      mockPrisma.resident.count.mockResolvedValue(2);

      await expect(service.delete('unit-uuid-001', mockContext))
        .rejects.toThrow(UnitHasResidentsException);
    });
  });
});
