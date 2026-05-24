import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ReservationsService } from './reservations.service';
import {
  CommonAreaNotFoundException,
  TenantAccessDeniedException,
  CommonAreaValidationException,
  CommonAreaAccessDeniedException,
} from '../common-areas/exceptions';
import {
  ReservationConflictException,
  ResidentNotFoundException,
  ResidentCannotBookException,
  ReservationNotFoundException,
  ReservationAlreadyCanceledException,
  ReservationAccessDeniedException,
  ReservationNotPendingException,
} from './exceptions';

describe('ReservationsService', () => {
  let service: ReservationsService;
  let prismaService: PrismaService;

  const mockCondoId = 'condo-uuid-123';
  const mockUserId = 'user-uuid-456';
  const mockResidentId = 'resident-uuid-789';

  const mockContext = {
    role: Role.RESIDENT,
    condominiumId: mockCondoId,
    userId: mockUserId,
  };

  const mockAdminContext = {
    role: Role.ADMIN,
    condominiumId: mockCondoId,
    userId: 'admin-uuid',
  };

  const mockCommonArea = {
    id: 'area-uuid-001',
    name: 'Salão de Festas',
    description: 'Espaço para eventos',
    capacity: 50,
    openTime: '08:00',
    closeTime: '22:00',
    operatingDays: '1,2,3,4,5,6,7',
    requiresApproval: false,
    icon: 'celebration',
    isUnderMaintenance: false,
    condominiumId: mockCondoId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockResident = {
    id: mockResidentId,
    userId: mockUserId,
    unitId: null,
    document: null,
    phone: null,
    canBook: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrisma = {
    commonArea: {
      findFirst: jest.fn(),
    },
    resident: {
      findUnique: jest.fn(),
    },
    reservation: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    reservationApproval: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
    prismaService = module.get<PrismaService>(PrismaService);
    jest.resetAllMocks();
  });

  describe('createReservation', () => {
    const validInput = {
      commonAreaId: 'area-uuid-001',
      date: '2026-07-15',
      startTime: '10:00',
      endTime: '12:00',
    };

    it('(RESIDENT) deve criar reserva com dados válidos', async () => {
      mockPrisma.commonArea.findFirst.mockResolvedValue(mockCommonArea);
      mockPrisma.resident.findUnique.mockResolvedValue(mockResident);
      mockPrisma.reservation.findMany.mockResolvedValue([]);
      mockPrisma.reservation.create.mockResolvedValue({
        id: 'res-uuid-001',
        residentId: mockResidentId,
        commonAreaId: 'area-uuid-001',
        startTime: new Date('2026-07-15T10:00:00.000Z'),
        endTime: new Date('2026-07-15T12:00:00.000Z'),
        status: 'APPROVED',
        notes: null,
        canceledById: null,
        canceledAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.createReservation(validInput, mockContext);

      expect(result).toHaveProperty('id');
      expect(result.status).toBe('APPROVED');
      expect(mockPrisma.reservation.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            residentId: mockResidentId,
            commonAreaId: 'area-uuid-001',
            status: 'APPROVED',
          }),
        }),
      );
    });

    it('(ADMIN) deve criar reserva em nome de um residente', async () => {
      mockPrisma.commonArea.findFirst.mockResolvedValue(mockCommonArea);
      mockPrisma.resident.findUnique.mockResolvedValue(mockResident);
      mockPrisma.reservation.findMany.mockResolvedValue([]);
      mockPrisma.reservation.create.mockResolvedValue({
        id: 'res-uuid-002',
        residentId: mockResidentId,
        commonAreaId: 'area-uuid-001',
        startTime: new Date('2026-07-15T14:00:00.000Z'),
        endTime: new Date('2026-07-15T16:00:00.000Z'),
        status: 'APPROVED',
        notes: null,
        canceledById: null,
        canceledAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.createReservation(
        { ...validInput, residentId: mockResidentId },
        mockAdminContext,
      );

      expect(result).toHaveProperty('id');
      expect(result.status).toBe('APPROVED');
    });

    it('deve lançar CommonAreaNotFoundException se área não existir', async () => {
      mockPrisma.commonArea.findFirst.mockResolvedValue(null);

      await expect(service.createReservation(validInput, mockContext))
        .rejects.toThrow(CommonAreaNotFoundException);
    });

    it('deve lançar TenantAccessDeniedException se área for de outro condomínio', async () => {
      mockPrisma.commonArea.findFirst.mockResolvedValue({
        ...mockCommonArea,
        condominiumId: 'outro-condo',
      });

      await expect(service.createReservation(validInput, mockContext))
        .rejects.toThrow(TenantAccessDeniedException);
    });

    it('deve lançar erro se área estiver em manutenção', async () => {
      mockPrisma.commonArea.findFirst.mockResolvedValue({
        ...mockCommonArea,
        isUnderMaintenance: true,
      });

      await expect(service.createReservation(validInput, mockContext))
        .rejects.toThrow(CommonAreaValidationException);
    });

    it('deve lançar erro se data for fora dos dias operacionais', async () => {
      mockPrisma.commonArea.findFirst.mockResolvedValue({
        ...mockCommonArea,
        operatingDays: '1,2,3,4,5',
      });

      const inputSabado = { ...validInput, date: '2026-07-18' };
      await expect(service.createReservation(inputSabado, mockContext))
        .rejects.toThrow(CommonAreaValidationException);
    });

    it('deve lançar erro se horário for antes da abertura', async () => {
      mockPrisma.commonArea.findFirst.mockResolvedValue(mockCommonArea);

      await expect(service.createReservation(
        { ...validInput, startTime: '06:00', endTime: '08:00' },
        mockContext,
      )).rejects.toThrow(CommonAreaValidationException);
    });

    it('deve lançar erro se horário for depois do fechamento', async () => {
      mockPrisma.commonArea.findFirst.mockResolvedValue(mockCommonArea);

      await expect(service.createReservation(
        { ...validInput, startTime: '22:00', endTime: '23:00' },
        mockContext,
      )).rejects.toThrow(CommonAreaValidationException);
    });

    it('deve lançar erro se startTime >= endTime', async () => {
      mockPrisma.commonArea.findFirst.mockResolvedValue(mockCommonArea);

      await expect(service.createReservation(
        { ...validInput, startTime: '14:00', endTime: '13:00' },
        mockContext,
      )).rejects.toThrow(CommonAreaValidationException);
    });

    it('deve lançar erro se duração for menor que 2 horas', async () => {
      mockPrisma.commonArea.findFirst.mockResolvedValue(mockCommonArea);

      await expect(service.createReservation(
        { ...validInput, startTime: '14:00', endTime: '15:00' },
        mockContext,
      )).rejects.toThrow(CommonAreaValidationException);
    });

    it('deve lançar erro se duração for exatamente 1h59', async () => {
      mockPrisma.commonArea.findFirst.mockResolvedValue(mockCommonArea);

      await expect(service.createReservation(
        { ...validInput, startTime: '14:00', endTime: '15:59' },
        mockContext,
      )).rejects.toThrow(CommonAreaValidationException);
    });

    it('deve aceitar duração de exatamente 2 horas', async () => {
      mockPrisma.commonArea.findFirst.mockResolvedValue(mockCommonArea);
      mockPrisma.resident.findUnique.mockResolvedValue(mockResident);
      mockPrisma.reservation.findMany.mockResolvedValue([]);
      mockPrisma.reservation.create.mockResolvedValue({
        id: 'res-uuid-min2h',
        residentId: mockResidentId,
        commonAreaId: 'area-uuid-001',
        startTime: new Date('2026-07-15T14:00:00.000Z'),
        endTime: new Date('2026-07-15T16:00:00.000Z'),
        status: 'APPROVED',
        notes: null,
        canceledById: null,
        canceledAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.createReservation(
        { ...validInput, startTime: '14:00', endTime: '16:00' },
        mockContext,
      );

      expect(result).toHaveProperty('id');
      expect(result.status).toBe('APPROVED');
    });

    it('deve criar reserva como PENDING quando área exigir aprovação', async () => {
      mockPrisma.commonArea.findFirst.mockResolvedValue({
        ...mockCommonArea,
        requiresApproval: true,
      });
      mockPrisma.resident.findUnique.mockResolvedValue(mockResident);
      mockPrisma.reservation.findMany.mockResolvedValue([]);
      mockPrisma.reservation.create.mockResolvedValue({
        id: 'res-pending',
        residentId: mockResidentId,
        commonAreaId: 'area-uuid-001',
        startTime: new Date('2026-07-15T14:00:00.000Z'),
        endTime: new Date('2026-07-15T16:00:00.000Z'),
        status: 'PENDING',
        notes: null,
        canceledById: null,
        canceledAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.createReservation(validInput, mockContext);

      expect(result).toHaveProperty('id');
      expect(result.status).toBe('PENDING');
    });

    it('deve lançar erro se houver reserva conflitante', async () => {
      mockPrisma.commonArea.findFirst.mockResolvedValue(mockCommonArea);
      mockPrisma.resident.findUnique.mockResolvedValue(mockResident);
      mockPrisma.reservation.findMany.mockResolvedValue([
        {
          id: 'conflict-res',
          startTime: new Date('2026-07-15T10:00:00.000Z'),
          endTime: new Date('2026-07-15T12:00:00.000Z'),
          status: 'APPROVED',
        },
      ]);

      await expect(service.createReservation(
        { ...validInput, startTime: '11:00', endTime: '13:00' },
        mockContext,
      )).rejects.toThrow(ReservationConflictException);
    });

    it('deve lançar CommonAreaAccessDeniedException se RESIDENT não tiver condominiumId', async () => {
      const contextSemCondo = { role: Role.RESIDENT, condominiumId: null, userId: 'user-id' };

      await expect(service.createReservation(validInput, contextSemCondo as any))
        .rejects.toThrow(CommonAreaAccessDeniedException);
    });

    it('deve lançar erro se RESIDENT não tiver perfil de residente', async () => {
      mockPrisma.commonArea.findFirst.mockResolvedValue(mockCommonArea);
      mockPrisma.resident.findUnique.mockResolvedValue(null);

      await expect(service.createReservation(validInput, mockContext))
        .rejects.toThrow(ResidentNotFoundException);
    });

    it('deve lançar erro se RESIDENT não puder reservar', async () => {
      mockPrisma.commonArea.findFirst.mockResolvedValue(mockCommonArea);
      mockPrisma.resident.findUnique.mockResolvedValue({ ...mockResident, canBook: false });

      await expect(service.createReservation(validInput, mockContext))
        .rejects.toThrow(ResidentCannotBookException);
    });
  });

  describe('listReservations', () => {
    const mockReservations = [
      {
        id: 'res-1',
        residentId: mockResidentId,
        commonAreaId: 'area-1',
        startTime: new Date('2026-07-15T10:00:00.000Z'),
        endTime: new Date('2026-07-15T12:00:00.000Z'),
        status: 'APPROVED',
        notes: null,
        canceledById: null,
        canceledAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        commonArea: { id: 'area-1', name: 'Salão de Festas', icon: 'celebration' },
      },
    ];

    it('(RESIDENT) deve listar próprias reservas', async () => {
      mockPrisma.resident.findUnique.mockResolvedValue(mockResident);
      mockPrisma.reservation.findMany.mockResolvedValue(mockReservations);
      mockPrisma.reservation.count.mockResolvedValue(1);

      const result = await service.listReservations(mockContext);

      expect(result.reservations).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(mockPrisma.reservation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ residentId: mockResidentId }),
        }),
      );
    });

    it('(ADMIN) deve listar reservas do condomínio', async () => {
      mockPrisma.reservation.findMany.mockResolvedValue(mockReservations);
      mockPrisma.reservation.count.mockResolvedValue(1);

      const result = await service.listReservations(mockAdminContext);

      expect(result.reservations).toHaveLength(1);
      expect(mockPrisma.reservation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            commonArea: { condominiumId: mockCondoId },
          }),
        }),
      );
    });

    it('deve filtrar por status', async () => {
      mockPrisma.resident.findUnique.mockResolvedValue(mockResident);
      mockPrisma.reservation.findMany.mockResolvedValue([]);
      mockPrisma.reservation.count.mockResolvedValue(0);

      await service.listReservations(mockContext, { status: 'PENDING' });

      expect(mockPrisma.reservation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'PENDING' }),
        }),
      );
    });

    it('deve retornar lista vazia se não houver reservas', async () => {
      mockPrisma.resident.findUnique.mockResolvedValue(mockResident);
      mockPrisma.reservation.findMany.mockResolvedValue([]);
      mockPrisma.reservation.count.mockResolvedValue(0);

      const result = await service.listReservations(mockContext);

      expect(result.reservations).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('deve lançar erro se RESIDENT não tiver perfil', async () => {
      mockPrisma.resident.findUnique.mockResolvedValue(null);

      await expect(service.listReservations(mockContext))
        .rejects.toThrow(ResidentNotFoundException);
    });

    it('deve lançar CommonAreaAccessDeniedException se não tiver condominiumId', async () => {
      const ctx = { role: Role.RESIDENT, condominiumId: null, userId: 'user' };

      await expect(service.listReservations(ctx as any))
        .rejects.toThrow(CommonAreaAccessDeniedException);
    });
  });

  describe('cancelReservation', () => {
    const mockReservation = {
      id: 'res-1',
      residentId: mockResidentId,
      commonAreaId: 'area-1',
      startTime: new Date('2026-07-20T14:00:00.000Z'),
      endTime: new Date('2026-07-20T16:00:00.000Z'),
      status: 'APPROVED',
      notes: null,
      canceledById: null,
      canceledAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      commonArea: { id: 'area-1', condominiumId: mockCondoId },
    };

    it('(RESIDENT) deve cancelar própria reserva', async () => {
      mockPrisma.reservation.findFirst.mockResolvedValue(mockReservation);
      mockPrisma.resident.findUnique.mockResolvedValue(mockResident);
      mockPrisma.reservation.update.mockResolvedValue({ ...mockReservation, status: 'CANCELED', canceledById: mockUserId, canceledAt: new Date() });

      const result = await service.cancelReservation('res-1', mockContext);

      expect(result.status).toBe('CANCELED');
      expect(mockPrisma.reservation.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'res-1' },
          data: expect.objectContaining({
            status: 'CANCELED',
            canceledById: mockUserId,
          }),
        }),
      );
    });

    it('(ADMIN) deve cancelar qualquer reserva do condomínio', async () => {
      mockPrisma.reservation.findFirst.mockResolvedValue(mockReservation);
      mockPrisma.reservation.update.mockResolvedValue({ ...mockReservation, status: 'CANCELED', canceledById: 'admin-uuid', canceledAt: new Date() });

      const result = await service.cancelReservation('res-1', mockAdminContext);

      expect(result.status).toBe('CANCELED');
    });

    it('deve lançar ReservationNotFoundException se reserva não existir', async () => {
      mockPrisma.reservation.findFirst.mockResolvedValue(null);

      await expect(service.cancelReservation('inexistente', mockContext))
        .rejects.toThrow(ReservationNotFoundException);
    });

    it('deve lançar TenantAccessDeniedException se reserva for de outro condomínio', async () => {
      mockPrisma.reservation.findFirst.mockResolvedValue({
        ...mockReservation,
        commonArea: { id: 'area-1', condominiumId: 'outro-condo' },
      });

      await expect(service.cancelReservation('res-1', mockContext))
        .rejects.toThrow(TenantAccessDeniedException);
    });

    it('deve lançar ReservationAlreadyCanceledException se já cancelada', async () => {
      mockPrisma.reservation.findFirst.mockResolvedValue({
        ...mockReservation,
        status: 'CANCELED',
      });

      await expect(service.cancelReservation('res-1', mockContext))
        .rejects.toThrow(ReservationAlreadyCanceledException);
    });

    it('(RESIDENT) deve lançar erro ao cancelar reserva de outro', async () => {
      mockPrisma.reservation.findFirst.mockResolvedValue({
        ...mockReservation,
        residentId: 'outro-resident',
      });
      mockPrisma.resident.findUnique.mockResolvedValue(mockResident);

      await expect(service.cancelReservation('res-1', mockContext))
        .rejects.toThrow(ReservationAccessDeniedException);
    });
  });

  describe('approveReservation', () => {
    const mockReservation = {
      id: 'res-1',
      residentId: mockResidentId,
      commonAreaId: 'area-1',
      startTime: new Date('2026-07-20T14:00:00.000Z'),
      endTime: new Date('2026-07-20T16:00:00.000Z'),
      status: 'PENDING',
      notes: null,
      canceledById: null,
      canceledAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      commonArea: { id: 'area-1', condominiumId: mockCondoId },
    };

    it('(ADMIN) deve aprovar reserva pendente', async () => {
      mockPrisma.reservation.findFirst.mockResolvedValue(mockReservation);
      mockPrisma.$transaction.mockResolvedValue([
        { ...mockReservation, status: 'APPROVED' },
        { id: 'approval-1', reservationId: 'res-1', status: 'APPROVED' },
      ]);

      const result = await service.approveReservation('res-1', mockAdminContext);

      expect(result.status).toBe('APPROVED');
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('deve lançar ReservationAccessDeniedException se não for ADMIN', async () => {
      await expect(service.approveReservation('res-1', mockContext))
        .rejects.toThrow(ReservationAccessDeniedException);
    });

    it('deve lançar ReservationNotFoundException se reserva não existir', async () => {
      mockPrisma.reservation.findFirst.mockResolvedValue(null);

      await expect(service.approveReservation('inexistente', mockAdminContext))
        .rejects.toThrow(ReservationNotFoundException);
    });

    it('deve lançar TenantAccessDeniedException se for de outro condomínio', async () => {
      mockPrisma.reservation.findFirst.mockResolvedValue({
        ...mockReservation,
        commonArea: { id: 'area-1', condominiumId: 'outro-condo' },
      });

      await expect(service.approveReservation('res-1', mockAdminContext))
        .rejects.toThrow(TenantAccessDeniedException);
    });

    it('deve lançar ReservationNotPendingException se já estiver aprovada', async () => {
      mockPrisma.reservation.findFirst.mockResolvedValue({
        ...mockReservation,
        status: 'APPROVED',
      });

      await expect(service.approveReservation('res-1', mockAdminContext))
        .rejects.toThrow(ReservationNotPendingException);
    });

    it('deve lançar ReservationNotPendingException se já estiver rejeitada', async () => {
      mockPrisma.reservation.findFirst.mockResolvedValue({
        ...mockReservation,
        status: 'REJECTED',
      });

      await expect(service.approveReservation('res-1', mockAdminContext))
        .rejects.toThrow(ReservationNotPendingException);
    });
  });

  describe('rejectReservation', () => {
    const mockReservation = {
      id: 'res-1',
      residentId: mockResidentId,
      commonAreaId: 'area-1',
      startTime: new Date('2026-07-20T14:00:00.000Z'),
      endTime: new Date('2026-07-20T16:00:00.000Z'),
      status: 'PENDING',
      notes: null,
      canceledById: null,
      canceledAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      commonArea: { id: 'area-1', condominiumId: mockCondoId },
    };

    it('(ADMIN) deve rejeitar reserva pendente', async () => {
      mockPrisma.reservation.findFirst.mockResolvedValue(mockReservation);
      mockPrisma.$transaction.mockResolvedValue([
        { ...mockReservation, status: 'REJECTED' },
        { id: 'approval-1', reservationId: 'res-1', status: 'REJECTED' },
      ]);

      const result = await service.rejectReservation('res-1', mockAdminContext);

      expect(result.status).toBe('REJECTED');
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('deve lançar ReservationAccessDeniedException se não for ADMIN', async () => {
      await expect(service.rejectReservation('res-1', mockContext))
        .rejects.toThrow(ReservationAccessDeniedException);
    });

    it('deve lançar ReservationNotFoundException se reserva não existir', async () => {
      mockPrisma.reservation.findFirst.mockResolvedValue(null);

      await expect(service.rejectReservation('inexistente', mockAdminContext))
        .rejects.toThrow(ReservationNotFoundException);
    });

    it('deve lançar TenantAccessDeniedException se for de outro condomínio', async () => {
      mockPrisma.reservation.findFirst.mockResolvedValue({
        ...mockReservation,
        commonArea: { id: 'area-1', condominiumId: 'outro-condo' },
      });

      await expect(service.rejectReservation('res-1', mockAdminContext))
        .rejects.toThrow(TenantAccessDeniedException);
    });

    it('deve lançar ReservationNotPendingException se já estiver cancelada', async () => {
      mockPrisma.reservation.findFirst.mockResolvedValue({
        ...mockReservation,
        status: 'CANCELED',
      });

      await expect(service.rejectReservation('res-1', mockAdminContext))
        .rejects.toThrow(ReservationNotPendingException);
    });
  });
});
