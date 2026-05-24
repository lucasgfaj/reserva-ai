import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ResidentsController } from './residents.controller';
import { ResidentsService } from './residents.service';

describe('ResidentsController', () => {
  let controller: ResidentsController;
  let service: ResidentsService;

  const mockAuthRequest = {
    user: { sub: 'admin-id', email: 'admin@test.com', role: 'ADMIN', condominiumId: 'condo-id' },
  };

  const mockService = {
    listResidents: jest.fn(),
    getResidentById: jest.fn(),
    createResident: jest.fn(),
    updateResidentPermissions: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResidentsController],
      providers: [
        { provide: ResidentsService, useValue: mockService },
        { provide: JwtService, useValue: { verifyAsync: jest.fn() } },
        JwtAuthGuard,
      ],
    }).compile();

    controller = module.get<ResidentsController>(ResidentsController);
    service = module.get<ResidentsService>(ResidentsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call listResidents with correct params', async () => {
      const expected = { residents: [], total: 0 };
      mockService.listResidents.mockResolvedValue(expected);

      const result = await controller.findAll(mockAuthRequest as any);

      expect(service.listResidents).toHaveBeenCalledWith({
        role: 'ADMIN',
        condominiumId: 'condo-id',
      });
      expect(result).toEqual(expected);
    });
  });

  describe('findOne', () => {
    it('should call getResidentById with correct params', async () => {
      const expected = { id: 'resident-id', name: 'John' };
      mockService.getResidentById.mockResolvedValue(expected);

      const result = await controller.findOne('resident-id', mockAuthRequest as any);

      expect(service.getResidentById).toHaveBeenCalledWith('resident-id', {
        role: 'ADMIN',
        condominiumId: 'condo-id',
      });
      expect(result).toEqual(expected);
    });
  });

  describe('create', () => {
    it('should call createResident with correct params', async () => {
      const dto = { name: 'John', email: 'john@test.com', canBook: true };
      const expected = { message: 'Morador cadastrado', user: { id: 'new-id' } };
      mockService.createResident.mockResolvedValue(expected);

      const result = await controller.create(dto as any, mockAuthRequest as any);

      expect(service.createResident).toHaveBeenCalledWith(dto, {
        userId: 'admin-id',
        email: 'admin@test.com',
        role: 'ADMIN',
        condominiumId: 'condo-id',
      });
      expect(result).toEqual(expected);
    });
  });

  describe('updatePermissions', () => {
    it('should call updateResidentPermissions with correct params', async () => {
      const dto = { canBook: false };
      const expected = { message: 'Permissão atualizada', canBook: false };
      mockService.updateResidentPermissions.mockResolvedValue(expected);

      const result = await controller.updatePermissions('resident-id', dto as any, mockAuthRequest as any);

      expect(service.updateResidentPermissions).toHaveBeenCalledWith('resident-id', false, {
        role: 'ADMIN',
        condominiumId: 'condo-id',
      });
      expect(result).toEqual(expected);
    });
  });
});