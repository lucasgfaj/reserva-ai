import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CommonAreasController } from './common-areas.controller';
import { CommonAreasService } from './common-areas.service';

describe('CommonAreasController', () => {
  let controller: CommonAreasController;
  let service: CommonAreasService;

  const mockAuthRequest = {
    user: { sub: 'admin-id', email: 'admin@test.com', role: 'ADMIN', condominiumId: 'condo-id' },
  };

  const mockService = {
    listCommonAreas: jest.fn(),
    getCommonAreaById: jest.fn(),
    createCommonArea: jest.fn(),
    updateCommonArea: jest.fn(),
    deleteCommonArea: jest.fn(),
    checkAvailability: jest.fn(),
    getBusyDays: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommonAreasController],
      providers: [
        { provide: CommonAreasService, useValue: mockService },
        { provide: JwtService, useValue: { verifyAsync: jest.fn() } },
        JwtAuthGuard,
      ],
    }).compile();

    controller = module.get<CommonAreasController>(CommonAreasController);
    service = module.get<CommonAreasService>(CommonAreasService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call listCommonAreas with correct params', async () => {
      const expected = { commonAreas: [], total: 0 };
      mockService.listCommonAreas.mockResolvedValue(expected);

      const result = await controller.findAll(mockAuthRequest as any);

      expect(service.listCommonAreas).toHaveBeenCalledWith({
        role: 'ADMIN',
        condominiumId: 'condo-id',
        userId: 'admin-id',
      });
      expect(result).toEqual(expected);
    });
  });

  describe('findOne', () => {
    it('should call getCommonAreaById with correct params', async () => {
      const expected = { id: 'area-id', name: 'Salão de Festas' };
      mockService.getCommonAreaById.mockResolvedValue(expected);

      const result = await controller.findOne('area-id', mockAuthRequest as any);

      expect(service.getCommonAreaById).toHaveBeenCalledWith('area-id', {
        role: 'ADMIN',
        condominiumId: 'condo-id',
        userId: 'admin-id',
      });
      expect(result).toEqual(expected);
    });
  });

  describe('create', () => {
    it('should call createCommonArea with correct params', async () => {
      const dto = {
        name: 'Salão de Festas',
        description: 'Espaço para eventos',
        capacity: 50,
        openTime: '08:00',
        closeTime: '22:00',
        operatingDays: [1, 2, 3, 4, 5, 6, 0],
        requiresApproval: false,
      };
      const expected = { id: 'new-area', name: 'Salão de Festas' };
      mockService.createCommonArea.mockResolvedValue(expected);

      const result = await controller.create(dto as any, mockAuthRequest as any);

      expect(service.createCommonArea).toHaveBeenCalledWith(dto, {
        role: 'ADMIN',
        condominiumId: 'condo-id',
        userId: 'admin-id',
      });
      expect(result).toEqual(expected);
    });
  });

  describe('update', () => {
    it('should call updateCommonArea with correct params', async () => {
      const dto = { name: 'Salão Atualizado', capacity: 60 };
      const expected = { id: 'area-id', name: 'Salão Atualizado' };
      mockService.updateCommonArea.mockResolvedValue(expected);

      const result = await controller.update('area-id', dto as any, mockAuthRequest as any);

      expect(service.updateCommonArea).toHaveBeenCalledWith('area-id', dto, {
        role: 'ADMIN',
        condominiumId: 'condo-id',
        userId: 'admin-id',
      });
      expect(result).toEqual(expected);
    });
  });

  describe('getBusyDays', () => {
    it('should call getBusyDays with correct params', async () => {
      const expected = { commonAreaId: 'area-id', year: 2026, month: 6, busyDates: ['2026-06-15'] };
      mockService.getBusyDays.mockResolvedValue(expected);

      const result = await controller.getBusyDays('area-id', '2026', '6', mockAuthRequest as any);

      expect(service.getBusyDays).toHaveBeenCalledWith('area-id', 2026, 6, {
        role: 'ADMIN',
        condominiumId: 'condo-id',
        userId: 'admin-id',
      });
      expect(result).toEqual(expected);
    });
  });

  describe('checkAvailability', () => {
    it('should call checkAvailability with correct params', async () => {
      const query = { date: '2026-06-15', startTime: '10:00', endTime: '12:00' };
      const expected = { available: true, conflicts: [] };
      mockService.checkAvailability.mockResolvedValue(expected);

      const result = await controller.checkAvailability('area-id', query as any, mockAuthRequest as any);

      expect(service.checkAvailability).toHaveBeenCalledWith('area-id', query, {
        role: 'ADMIN',
        condominiumId: 'condo-id',
        userId: 'admin-id',
      });
      expect(result).toEqual(expected);
    });
  });

  describe('delete', () => {
    it('should call deleteCommonArea with correct params', async () => {
      const expected = { message: 'Área comum deletada com sucesso' };
      mockService.deleteCommonArea.mockResolvedValue(expected);

      const result = await controller.delete('area-id', mockAuthRequest as any);

      expect(service.deleteCommonArea).toHaveBeenCalledWith('area-id', {
        role: 'ADMIN',
        condominiumId: 'condo-id',
        userId: 'admin-id',
      });
      expect(result).toEqual(expected);
    });
  });
});