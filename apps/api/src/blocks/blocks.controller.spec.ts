import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BlocksController } from './blocks.controller';
import { BlocksService } from './blocks.service';

describe('BlocksController', () => {
  let controller: BlocksController;
  let service: BlocksService;

  const mockAuthRequest = {
    user: { sub: 'admin-id', email: 'admin@test.com', role: 'ADMIN', condominiumId: 'condo-id' },
  };

  const mockService = {
    list: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlocksController],
      providers: [
        { provide: BlocksService, useValue: mockService },
        { provide: JwtService, useValue: { verifyAsync: jest.fn() } },
        JwtAuthGuard,
      ],
    }).compile();

    controller = module.get<BlocksController>(BlocksController);
    service = module.get<BlocksService>(BlocksService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call service.list with correct params', async () => {
      const expected = { blocks: [], total: 0, page: 1, limit: 10, totalPages: 0 };
      mockService.list.mockResolvedValue(expected);

      const result = await controller.findAll(mockAuthRequest as any, 1, 10);

      expect(service.list).toHaveBeenCalledWith({
        role: 'ADMIN',
        condominiumId: 'condo-id',
        userId: 'admin-id',
        page: 1,
        limit: 10,
      });
      expect(result).toEqual(expected);
    });
  });

  describe('findOne', () => {
    it('should call service.getById with correct params', async () => {
      const expected = { id: 'block-id', name: 'Bloco A', condominiumId: 'condo-id' };
      mockService.getById.mockResolvedValue(expected);

      const result = await controller.findOne('block-id', mockAuthRequest as any);

      expect(service.getById).toHaveBeenCalledWith('block-id', {
        role: 'ADMIN',
        condominiumId: 'condo-id',
        userId: 'admin-id',
      });
      expect(result).toEqual(expected);
    });
  });

  describe('create', () => {
    it('should call service.create with correct params', async () => {
      const dto = { name: 'Bloco A' };
      const expected = { id: 'new-block', name: 'Bloco A', condominiumId: 'condo-id' };
      mockService.create.mockResolvedValue(expected);

      const result = await controller.create(dto as any, mockAuthRequest as any);

      expect(service.create).toHaveBeenCalledWith(dto, {
        role: 'ADMIN',
        condominiumId: 'condo-id',
        userId: 'admin-id',
      });
      expect(result).toEqual(expected);
    });
  });

  describe('update', () => {
    it('should call service.update with correct params', async () => {
      const dto = { name: 'Bloco A Atualizado' };
      const expected = { id: 'block-id', name: 'Bloco A Atualizado', condominiumId: 'condo-id' };
      mockService.update.mockResolvedValue(expected);

      const result = await controller.update('block-id', dto as any, mockAuthRequest as any);

      expect(service.update).toHaveBeenCalledWith('block-id', dto, {
        role: 'ADMIN',
        condominiumId: 'condo-id',
        userId: 'admin-id',
      });
      expect(result).toEqual(expected);
    });
  });

  describe('delete', () => {
    it('should call service.delete with correct params', async () => {
      const expected = { message: 'Bloco removido com sucesso.' };
      mockService.delete.mockResolvedValue(expected);

      const result = await controller.delete('block-id', mockAuthRequest as any);

      expect(service.delete).toHaveBeenCalledWith('block-id', {
        role: 'ADMIN',
        condominiumId: 'condo-id',
        userId: 'admin-id',
      });
      expect(result).toEqual(expected);
    });
  });
});
