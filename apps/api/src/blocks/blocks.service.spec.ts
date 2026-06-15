import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BlocksService } from './blocks.service';
import {
  BlockNotFoundException,
  BlockAccessDeniedException,
  BlockNameConflictException,
  BlockHasUnitsException,
} from './exceptions/block.exceptions';

describe('BlocksService', () => {
  let service: BlocksService;
  let prisma: PrismaService;

  const mockCondoId = 'condo-uuid-123';
  const mockUserId = 'user-uuid-456';
  const mockContext = { role: Role.ADMIN, condominiumId: mockCondoId, userId: mockUserId };
  const mockResidentContext = { role: Role.RESIDENT, condominiumId: mockCondoId, userId: 'resident-id' };

  const mockBlock = {
    id: 'block-uuid-001',
    name: 'Bloco A',
    condominiumId: mockCondoId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrisma = {
    block: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    unit: {
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlocksService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<BlocksService>(BlocksService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('list', () => {
    it('should list blocks of the condominium', async () => {
      mockPrisma.block.findMany.mockResolvedValue([mockBlock]);
      mockPrisma.block.count.mockResolvedValue(1);

      const result = await service.list(mockContext);

      expect(result.blocks).toHaveLength(1);
      expect(result.blocks[0].name).toBe('Bloco A');
      expect(result.total).toBe(1);
      expect(mockPrisma.block.findMany).toHaveBeenCalledWith({
        where: { condominiumId: mockCondoId },
        orderBy: { name: 'asc' },
        skip: 0,
        take: 10,
      });
    });

    it('should return empty list if no blocks', async () => {
      mockPrisma.block.findMany.mockResolvedValue([]);
      mockPrisma.block.count.mockResolvedValue(0);

      const result = await service.list(mockContext);

      expect(result.blocks).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should paginate results', async () => {
      mockPrisma.block.findMany.mockResolvedValue([mockBlock]);
      mockPrisma.block.count.mockResolvedValue(10);

      const result = await service.list({ ...mockContext, page: 2, limit: 5 });

      expect(mockPrisma.block.findMany).toHaveBeenCalledWith({
        where: { condominiumId: mockCondoId },
        orderBy: { name: 'asc' },
        skip: 5,
        take: 5,
      });
      expect(result.page).toBe(2);
      expect(result.limit).toBe(5);
      expect(result.totalPages).toBe(2);
    });

    it('should allow RESIDENT to list', async () => {
      mockPrisma.block.findMany.mockResolvedValue([mockBlock]);
      mockPrisma.block.count.mockResolvedValue(1);

      const result = await service.list(mockResidentContext);

      expect(result.blocks).toHaveLength(1);
    });
  });

  describe('getById', () => {
    it('should return block by id', async () => {
      mockPrisma.block.findFirst.mockResolvedValue(mockBlock);

      const result = await service.getById('block-uuid-001', mockContext);

      expect(result.id).toBe('block-uuid-001');
      expect(result.name).toBe('Bloco A');
    });

    it('should throw BlockNotFoundException if not found', async () => {
      mockPrisma.block.findFirst.mockResolvedValue(null);

      await expect(service.getById('inexistente', mockContext))
        .rejects.toThrow(BlockNotFoundException);
    });

    it('should allow RESIDENT to get by id', async () => {
      mockPrisma.block.findFirst.mockResolvedValue(mockBlock);

      const result = await service.getById('block-uuid-001', mockResidentContext);

      expect(result.id).toBe('block-uuid-001');
    });
  });

  describe('create', () => {
    const createDto = { name: 'Bloco A' };

    it('should create a block', async () => {
      mockPrisma.block.findFirst.mockResolvedValue(null);
      mockPrisma.block.create.mockResolvedValue(mockBlock);

      const result = await service.create(createDto, mockContext);

      expect(result.id).toBe('block-uuid-001');
      expect(result.name).toBe('Bloco A');
      expect(mockPrisma.block.create).toHaveBeenCalledWith({
        data: {
          name: 'Bloco A',
          condominiumId: mockCondoId,
        },
      });
    });

    it('should throw BlockAccessDeniedException if not ADMIN', async () => {
      await expect(service.create(createDto, mockResidentContext))
        .rejects.toThrow(BlockAccessDeniedException);
    });

    it('should throw BlockNameConflictException if name already exists in condominium', async () => {
      mockPrisma.block.findFirst.mockResolvedValue(mockBlock);

      await expect(service.create(createDto, mockContext))
        .rejects.toThrow(BlockNameConflictException);
    });
  });

  describe('update', () => {
    const updateDto = { name: 'Bloco A Atualizado' };

    it('should update block name', async () => {
      mockPrisma.block.findFirst
        .mockResolvedValueOnce(mockBlock)
        .mockResolvedValueOnce(null);
      mockPrisma.block.update.mockResolvedValue({
        ...mockBlock,
        name: 'Bloco A Atualizado',
        updatedAt: new Date(),
      });

      const result = await service.update('block-uuid-001', updateDto, mockContext);

      expect(result.name).toBe('Bloco A Atualizado');
    });

    it('should throw BlockNotFoundException if not found', async () => {
      mockPrisma.block.findFirst.mockResolvedValue(null);

      await expect(service.update('inexistente', updateDto, mockContext))
        .rejects.toThrow(BlockNotFoundException);
    });

    it('should throw BlockAccessDeniedException if not ADMIN', async () => {
      await expect(service.update('block-uuid-001', updateDto, mockResidentContext))
        .rejects.toThrow(BlockAccessDeniedException);
    });

    it('should throw BlockNameConflictException if new name already exists', async () => {
      const outroBloco = { ...mockBlock, id: 'outro-block', name: 'Bloco B' };
      mockPrisma.block.findFirst
        .mockResolvedValueOnce(mockBlock)
        .mockResolvedValueOnce(outroBloco);

      await expect(service.update('block-uuid-001', { name: 'Bloco B' }, mockContext))
        .rejects.toThrow(BlockNameConflictException);
    });

    it('should allow keeping the same name', async () => {
      mockPrisma.block.findFirst
        .mockResolvedValueOnce(mockBlock)
        .mockResolvedValueOnce(mockBlock);
      mockPrisma.block.update.mockResolvedValue(mockBlock);

      const result = await service.update('block-uuid-001', { name: 'Bloco A' }, mockContext);

      expect(result.name).toBe('Bloco A');
    });
  });

  describe('delete', () => {
    it('should delete block if it has no units', async () => {
      mockPrisma.block.findFirst.mockResolvedValue(mockBlock);
      mockPrisma.unit.count.mockResolvedValue(0);
      mockPrisma.block.delete.mockResolvedValue(mockBlock);

      const result = await service.delete('block-uuid-001', mockContext);

      expect(result.message).toBe('Bloco removido com sucesso.');
      expect(mockPrisma.block.delete).toHaveBeenCalledWith({ where: { id: 'block-uuid-001' } });
    });

    it('should throw BlockNotFoundException if not found', async () => {
      mockPrisma.block.findFirst.mockResolvedValue(null);

      await expect(service.delete('inexistente', mockContext))
        .rejects.toThrow(BlockNotFoundException);
    });

    it('should throw BlockAccessDeniedException if not ADMIN', async () => {
      await expect(service.delete('block-uuid-001', mockResidentContext))
        .rejects.toThrow(BlockAccessDeniedException);
    });

    it('should throw BlockHasUnitsException if block has units', async () => {
      mockPrisma.block.findFirst.mockResolvedValue(mockBlock);
      mockPrisma.unit.count.mockResolvedValue(5);

      await expect(service.delete('block-uuid-001', mockContext))
        .rejects.toThrow(BlockHasUnitsException);
    });
  });
});
