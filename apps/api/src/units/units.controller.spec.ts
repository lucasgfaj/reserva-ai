import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UnitsController } from './units.controller';
import { UnitsService } from './units.service';

describe('UnitsController', () => {
  let controller: UnitsController;
  let service: UnitsService;

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
      controllers: [UnitsController],
      providers: [
        { provide: UnitsService, useValue: mockService },
        { provide: JwtService, useValue: { verifyAsync: jest.fn() } },
        JwtAuthGuard,
      ],
    }).compile();

    controller = module.get<UnitsController>(UnitsController);
    service = module.get<UnitsService>(UnitsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call service.list with correct params', async () => {
      const expected = { units: [], total: 0, page: 1, limit: 10, totalPages: 0 };
      mockService.list.mockResolvedValue(expected);

      const result = await controller.findAll(mockAuthRequest as any, 1, 10, undefined);

      expect(service.list).toHaveBeenCalledWith({
        role: 'ADMIN',
        condominiumId: 'condo-id',
        userId: 'admin-id',
        page: 1,
        limit: 10,
      });
      expect(result).toEqual(expected);
    });

    it('should pass blockId filter when provided', async () => {
      const expected = { units: [], total: 0, page: 1, limit: 10, totalPages: 0 };
      mockService.list.mockResolvedValue(expected);

      const result = await controller.findAll(mockAuthRequest as any, 1, 10, 'block-id');

      expect(service.list).toHaveBeenCalledWith({
        role: 'ADMIN',
        condominiumId: 'condo-id',
        userId: 'admin-id',
        page: 1,
        limit: 10,
        blockId: 'block-id',
      });
    });
  });

  describe('findOne', () => {
    it('should call service.getById with correct params', async () => {
      const expected = { id: 'unit-id', number: '101', blockId: 'block-id' };
      mockService.getById.mockResolvedValue(expected);

      const result = await controller.findOne('unit-id', mockAuthRequest as any);

      expect(service.getById).toHaveBeenCalledWith('unit-id', {
        role: 'ADMIN',
        condominiumId: 'condo-id',
        userId: 'admin-id',
      });
      expect(result).toEqual(expected);
    });
  });

  describe('create', () => {
    it('should call service.create with correct params', async () => {
      const dto = { number: '101', blockId: 'block-id' };
      const expected = { id: 'new-unit', number: '101', blockId: 'block-id' };
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
      const dto = { number: '102' };
      const expected = { id: 'unit-id', number: '102', blockId: 'block-id' };
      mockService.update.mockResolvedValue(expected);

      const result = await controller.update('unit-id', dto as any, mockAuthRequest as any);

      expect(service.update).toHaveBeenCalledWith('unit-id', dto, {
        role: 'ADMIN',
        condominiumId: 'condo-id',
        userId: 'admin-id',
      });
      expect(result).toEqual(expected);
    });
  });

  describe('delete', () => {
    it('should call service.delete with correct params', async () => {
      const expected = { message: 'Unidade removida com sucesso.' };
      mockService.delete.mockResolvedValue(expected);

      const result = await controller.delete('unit-id', mockAuthRequest as any);

      expect(service.delete).toHaveBeenCalledWith('unit-id', {
        role: 'ADMIN',
        condominiumId: 'condo-id',
        userId: 'admin-id',
      });
      expect(result).toEqual(expected);
    });
  });
});
