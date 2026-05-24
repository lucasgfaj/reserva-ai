import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';

describe('ReservationsController', () => {
  let controller: ReservationsController;
  let service: ReservationsService;

  const mockAuthRequest = {
    user: { sub: 'user-id', email: 'user@test.com', role: 'RESIDENT', condominiumId: 'condo-id' },
  };

  const mockService = {
    createReservation: jest.fn(),
    listReservations: jest.fn(),
    cancelReservation: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationsController],
      providers: [
        { provide: ReservationsService, useValue: mockService },
        { provide: JwtService, useValue: { verifyAsync: jest.fn() } },
        JwtAuthGuard,
      ],
    }).compile();

    controller = module.get<ReservationsController>(ReservationsController);
    service = module.get<ReservationsService>(ReservationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call listReservations with correct params', async () => {
      const expected = { reservations: [], total: 0 };
      mockService.listReservations.mockResolvedValue(expected);

      const result = await controller.findAll(mockAuthRequest as any, 10, 1, 'PENDING', undefined, undefined);

      expect(service.listReservations).toHaveBeenCalledWith({
        role: 'RESIDENT',
        condominiumId: 'condo-id',
        userId: 'user-id',
      }, { page: 1, limit: 10, status: 'PENDING', from: undefined, to: undefined });
      expect(result).toEqual(expected);
    });
  });

  describe('cancel', () => {
    it('should call cancelReservation with correct params', async () => {
      const expected = { id: 'res-id', status: 'CANCELED' };
      mockService.cancelReservation.mockResolvedValue(expected);

      const result = await controller.cancel('res-id', mockAuthRequest as any);

      expect(service.cancelReservation).toHaveBeenCalledWith('res-id', {
        role: 'RESIDENT',
        condominiumId: 'condo-id',
        userId: 'user-id',
      });
      expect(result).toEqual(expected);
    });
  });

  describe('create', () => {
    const dto = {
      commonAreaId: 'area-id',
      date: '2026-07-15',
      startTime: '10:00',
      endTime: '12:00',
    };

    it('should call createReservation with correct params', async () => {
      const expected = { id: 'res-id', status: 'PENDING' };
      mockService.createReservation.mockResolvedValue(expected);

      const result = await controller.create(dto as any, mockAuthRequest as any);

      expect(service.createReservation).toHaveBeenCalledWith(dto, {
        role: 'RESIDENT',
        condominiumId: 'condo-id',
        userId: 'user-id',
      });
      expect(result).toEqual(expected);
    });
  });
});
