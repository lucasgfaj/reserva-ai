import { Test, TestingModule } from '@nestjs/testing';
import { Role, ReservationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CommonAreasService } from './common-areas.service';
import { CreateCommonAreaValidator } from './validators/create-common-area.validator';
import {
  CommonAreaNotFoundException,
  CommonAreaAccessDeniedException,
  TenantAccessDeniedException,
  CommonAreaValidationException,
  CommonAreaNameConflictException,
  CommonAreaHasReservationsException,
} from './exceptions';
import {
  CommonAreaListOutput,
  CommonAreaDetailOutput,
  CommonAreaCreatedOutput,
  CommonAreaUpdatedOutput,
  CreateCommonAreaInput,
  UpdateCommonAreaInput,
  BusyDaysOutput,
} from './interfaces/common-areas.interface';

describe('CommonAreasService', () => {
  let service: CommonAreasService;
  let prismaService: PrismaService;

  const mockCondoId = 'condo-uuid-123';
  const mockUserId = 'user-uuid-456';

  const mockContext = {
    role: Role.ADMIN,
    condominiumId: mockCondoId,
    userId: mockUserId,
  };

  const mockResidentContext = {
    role: Role.RESIDENT,
    condominiumId: mockCondoId,
    userId: 'resident-uuid-789',
  };

  const mockCommonArea = {
    id: 'area-uuid-001',
    name: 'Salão de Festas',
    description: 'Espaço para eventos',
    capacity: 50,
    openTime: '08:00',
    closeTime: '22:00',
    operatingDays: '1,2,3,4,5,6,7',
    requiresApproval: true,
    icon: 'celebration',
    isUnderMaintenance: false,
    condominiumId: mockCondoId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrisma = {
    commonArea: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    reservation: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommonAreasService,
        CreateCommonAreaValidator,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CommonAreasService>(CommonAreasService);
    prismaService = module.get<PrismaService>(PrismaService);
    jest.resetAllMocks();
  });

  describe('listCommonAreas', () => {
    it('(ADMIN) deve listar áreas do condomínio ordenadas por nome', async () => {
      const areas = [mockCommonArea];
      mockPrisma.commonArea.findMany.mockResolvedValue(areas);
      mockPrisma.commonArea.count.mockResolvedValue(1);

      const result = await service.listCommonAreas(mockContext);

      expect(result.commonAreas).toEqual(areas);
      expect(result.total).toBe(1);
      expect(mockPrisma.commonArea.findMany).toHaveBeenCalledWith({
        where: { condominiumId: mockCondoId },
        orderBy: { name: 'asc' },
        skip: 0,
        take: 10,
      });
    });

    it('(RESIDENT) deve listar áreas do condomínio', async () => {
      const areas = [mockCommonArea];
      mockPrisma.commonArea.findMany.mockResolvedValue(areas);
      mockPrisma.commonArea.count.mockResolvedValue(1);

      const result = await service.listCommonAreas(mockResidentContext);

      expect(result.commonAreas).toEqual(areas);
      expect(result.total).toBe(1);
    });

    it('deve lançar CommonAreaAccessDeniedException para SUPER_ADMIN sem condomínio', async () => {
      const superAdminContext = { role: Role.SUPER_ADMIN, condominiumId: null, userId: 'super' };

      await expect(service.listCommonAreas(superAdminContext as any))
        .rejects.toThrow(CommonAreaAccessDeniedException);
    });

    it('deve retornar lista vazia se condomínio não tem áreas', async () => {
      mockPrisma.commonArea.findMany.mockResolvedValue([]);
      mockPrisma.commonArea.count.mockResolvedValue(0);

      const result = await service.listCommonAreas(mockContext);

      expect(result.commonAreas).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('getCommonAreaById', () => {
    it('deve retornar área se existir e pertencer ao condomínio', async () => {
      mockPrisma.commonArea.findFirst.mockResolvedValue(mockCommonArea);

      const result = await service.getCommonAreaById('area-uuid-001', mockContext);

      expect(result).toEqual(mockCommonArea);
    });

    it('deve lançar CommonAreaNotFoundException se área não existir', async () => {
      mockPrisma.commonArea.findFirst.mockResolvedValue(null);

      await expect(service.getCommonAreaById('inexistente', mockContext))
        .rejects.toThrow(CommonAreaNotFoundException);
    });

    it('deve lançar TenantAccessDeniedException se área for de outro condomínio', async () => {
      const areaOutroCondo = { ...mockCommonArea, condominiumId: 'outro-condo' };
      mockPrisma.commonArea.findFirst.mockResolvedValue(areaOutroCondo);

      await expect(service.getCommonAreaById('area-uuid-001', mockContext))
        .rejects.toThrow(TenantAccessDeniedException);
    });

    it('(RESIDENT) deve retornar área se pertencer ao condomínio', async () => {
      mockPrisma.commonArea.findFirst.mockResolvedValue(mockCommonArea);

      const result = await service.getCommonAreaById('area-uuid-001', mockResidentContext);

      expect(result).toEqual(mockCommonArea);
    });
  });

  describe('createCommonArea', () => {
    const validInput: CreateCommonAreaInput = {
      name: 'Churrasqueira',
      description: 'Área para churrasco',
      capacity: 20,
      openTime: '10:00',
      closeTime: '22:00',
      operatingDays: '1,2,3,4,5,6,7',
      requiresApproval: false,
    };

    it('deve criar área comum com dados válidos', async () => {
      mockPrisma.commonArea.findFirst.mockResolvedValue(null);
      mockPrisma.commonArea.create.mockResolvedValue({ ...mockCommonArea, ...validInput });

      const result = await service.createCommonArea(validInput, mockContext);

      expect(result).toHaveProperty('id');
      expect(mockPrisma.commonArea.create).toHaveBeenCalled();
    });

    it('deve aceitar operatingDays em formato texto separado por vírgulas', async () => {
      mockPrisma.commonArea.findFirst.mockResolvedValue(null);
      mockPrisma.commonArea.create.mockResolvedValue(mockCommonArea);

      const inputSemana = { ...validInput, operatingDays: '1,2,3,4,5' };
      const inputFds = { ...validInput, operatingDays: '6,7' };

      await service.createCommonArea(inputSemana, mockContext);
      await service.createCommonArea(inputFds, mockContext);

      expect(mockPrisma.commonArea.create).toHaveBeenCalledTimes(2);
    });

    it('deve validar formato HH:MM para openTime (com zero à esquerda)', async () => {
      const inputInvalido = { ...validInput, openTime: '8:00' };

      mockPrisma.commonArea.findFirst.mockResolvedValue(null);

      await expect(service.createCommonArea(inputInvalido, mockContext))
        .rejects.toThrow(CommonAreaValidationException);
    });

    it('deve validar formato HH:MM para closeTime (hora inválida)', async () => {
      const inputInvalido = { ...validInput, closeTime: '25:00' };

      mockPrisma.commonArea.findFirst.mockResolvedValue(null);

      await expect(service.createCommonArea(inputInvalido, mockContext))
        .rejects.toThrow(CommonAreaValidationException);
    });

    it('deve lançar CommonAreaNameConflictException se nome já existir no condomínio', async () => {
      mockPrisma.commonArea.findFirst.mockResolvedValue(mockCommonArea);

      await expect(service.createCommonArea(validInput, mockContext))
        .rejects.toThrow(CommonAreaNameConflictException);
    });

    it('deve lançar CommonAreaAccessDeniedException se não for ADMIN', async () => {
      await expect(service.createCommonArea(validInput, mockResidentContext))
        .rejects.toThrow(CommonAreaAccessDeniedException);
    });

    it('deve rejeitar capacidade negativa', async () => {
      const inputInvalido = { ...validInput, capacity: -1 };

      mockPrisma.commonArea.findFirst.mockResolvedValue(null);

      await expect(service.createCommonArea(inputInvalido, mockContext))
        .rejects.toThrow(CommonAreaValidationException);
    });

    it('deve criar área com ícone', async () => {
      mockPrisma.commonArea.findFirst.mockResolvedValue(null);
      const inputComIcon = { ...validInput, icon: 'pool' };
      mockPrisma.commonArea.create.mockResolvedValue({ ...mockCommonArea, ...inputComIcon });

      const result = await service.createCommonArea(inputComIcon, mockContext);

      expect(result.icon).toBe('pool');
      expect(mockPrisma.commonArea.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ icon: 'pool' }),
        }),
      );
    });

    it('deve criar área com isUnderMaintenance true', async () => {
      mockPrisma.commonArea.findFirst.mockResolvedValue(null);
      const inputEmManutencao = { ...validInput, isUnderMaintenance: true };
      mockPrisma.commonArea.create.mockResolvedValue({ ...mockCommonArea, ...inputEmManutencao });

      const result = await service.createCommonArea(inputEmManutencao, mockContext);

      expect(result.isUnderMaintenance).toBe(true);
    });

    it('deve criar área com isUnderMaintenance false por padrão', async () => {
      mockPrisma.commonArea.findFirst.mockResolvedValue(null);
      mockPrisma.commonArea.create.mockResolvedValue(mockCommonArea);

      const result = await service.createCommonArea(validInput, mockContext);

      expect(result.isUnderMaintenance).toBe(false);
    });
  });

  describe('updateCommonArea', () => {
    const updateInput: UpdateCommonAreaInput = {
      name: 'Salão de Festas Atualizado',
      capacity: 100,
    };

    it('deve atualizar área existente', async () => {
      mockPrisma.commonArea.findFirst
        .mockResolvedValueOnce(mockCommonArea)
        .mockResolvedValueOnce(null);
      mockPrisma.commonArea.update.mockResolvedValue({ ...mockCommonArea, name: 'Salão de Festas Atualizado', capacity: 100 });

      const result = await service.updateCommonArea('area-uuid-001', { name: 'Salão de Festas Atualizado', capacity: 100 }, mockContext);

      expect(result.name).toBe('Salão de Festas Atualizado');
      expect(result.capacity).toBe(100);
    });

    it('deve permitir atualizar sem alterar nome ( mesmo nome )', async () => {
      mockPrisma.commonArea.findFirst
        .mockResolvedValueOnce(mockCommonArea)
        .mockResolvedValueOnce(mockCommonArea);
      mockPrisma.commonArea.update.mockResolvedValue({ ...mockCommonArea, ...updateInput });

      const result = await service.updateCommonArea('area-uuid-001', { capacity: 100 }, mockContext);

      expect(result.capacity).toBe(100);
    });

    it('deve lançar CommonAreaNotFoundException se área não existir', async () => {
      mockPrisma.commonArea.findFirst.mockResolvedValue(null);

      await expect(service.updateCommonArea('inexistente', updateInput, mockContext))
        .rejects.toThrow(CommonAreaNotFoundException);
    });

    it('deve lançar TenantAccessDeniedException se área for de outro condomínio', async () => {
      const areaOutroCondo = { ...mockCommonArea, condominiumId: 'outro-condo' };
      mockPrisma.commonArea.findFirst.mockResolvedValue(areaOutroCondo);

      await expect(service.updateCommonArea('area-uuid-001', updateInput, mockContext))
        .rejects.toThrow(TenantAccessDeniedException);
    });

    it('deve lançar CommonAreaAccessDeniedException se não for ADMIN', async () => {
      await expect(service.updateCommonArea('area-uuid-001', updateInput, mockResidentContext))
        .rejects.toThrow(CommonAreaAccessDeniedException);
    });

    it('deve lançar CommonAreaNameConflictException se novo nome já existir', async () => {
      const areaComNome = { ...mockCommonArea, id: 'outra-area', name: 'Churrasqueira' };
      mockPrisma.commonArea.findFirst
        .mockResolvedValueOnce(mockCommonArea)
        .mockResolvedValueOnce(areaComNome);

      await expect(service.updateCommonArea('area-uuid-001', { name: 'Churrasqueira' }, mockContext))
        .rejects.toThrow(CommonAreaNameConflictException);
    });

    it('deve atualizar ícone da área', async () => {
      mockPrisma.commonArea.findFirst
        .mockResolvedValueOnce(mockCommonArea)
        .mockResolvedValueOnce(null);
      mockPrisma.commonArea.update.mockResolvedValue({ ...mockCommonArea, icon: 'pool' });

      const result = await service.updateCommonArea('area-uuid-001', { icon: 'pool' }, mockContext);

      expect(result.icon).toBe('pool');
    });

    it('deve atualizar isUnderMaintenance', async () => {
      mockPrisma.commonArea.findFirst
        .mockResolvedValueOnce(mockCommonArea)
        .mockResolvedValueOnce(null);
      mockPrisma.commonArea.update.mockResolvedValue({ ...mockCommonArea, isUnderMaintenance: true });

      const result = await service.updateCommonArea('area-uuid-001', { isUnderMaintenance: true }, mockContext);

      expect(result.isUnderMaintenance).toBe(true);
    });
  });

  describe('getBusyDays', () => {
    const mockArea = { ...mockCommonArea };

    it('deve retornar dias ocupados no mês', async () => {
      mockPrisma.commonArea.findFirst.mockResolvedValue(mockArea);
      mockPrisma.reservation.findMany.mockResolvedValue([
        {
          startTime: new Date('2026-06-15T10:00:00.000Z'),
          endTime: new Date('2026-06-15T12:00:00.000Z'),
        },
        {
          startTime: new Date('2026-06-20T14:00:00.000Z'),
          endTime: new Date('2026-06-20T16:00:00.000Z'),
        },
      ]);

      const result = await service.getBusyDays('area-uuid-001', 2026, 6, mockContext);

      expect(result.busyDates).toEqual(['2026-06-15', '2026-06-20']);
      expect(result.year).toBe(2026);
      expect(result.month).toBe(6);
    });

    it('deve retornar lista vazia se não houver reservas', async () => {
      mockPrisma.commonArea.findFirst.mockResolvedValue(mockArea);
      mockPrisma.reservation.findMany.mockResolvedValue([]);

      const result = await service.getBusyDays('area-uuid-001', 2026, 6, mockContext);

      expect(result.busyDates).toEqual([]);
    });

    it('deve incluir múltiplos dias para reservas que atravessam meia-noite', async () => {
      mockPrisma.commonArea.findFirst.mockResolvedValue(mockArea);
      mockPrisma.reservation.findMany.mockResolvedValue([
        {
          startTime: new Date('2026-06-14T22:00:00.000Z'),
          endTime: new Date('2026-06-15T02:00:00.000Z'),
        },
      ]);

      const result = await service.getBusyDays('area-uuid-001', 2026, 6, mockContext);

      expect(result.busyDates).toContain('2026-06-14');
      expect(result.busyDates).toContain('2026-06-15');
    });

    it('deve lançar CommonAreaNotFoundException se área não existir', async () => {
      mockPrisma.commonArea.findFirst.mockResolvedValue(null);

      await expect(service.getBusyDays('inexistente', 2026, 6, mockContext))
        .rejects.toThrow(CommonAreaNotFoundException);
    });
  });

  describe('checkAvailability', () => {
    const mockArea = {
      ...mockCommonArea,
      openTime: '08:00',
      closeTime: '22:00',
      operatingDays: '1,2,3,4,5,6,7',
      isUnderMaintenance: false,
    };

    const mockReservations = [
      {
        id: 'res-1',
        startTime: new Date('2026-06-15T14:00:00.000Z'),
        endTime: new Date('2026-06-15T16:00:00.000Z'),
        status: 'APPROVED',
      },
    ];

    it('deve retornar disponível se não houver reservas conflitantes', async () => {
      mockPrisma.commonArea.findFirst.mockResolvedValue(mockArea);
      mockPrisma.reservation.findMany.mockResolvedValue([]);

      const result = await service.checkAvailability('area-uuid-001', {
        date: '2026-06-15',
        startTime: '10:00',
        endTime: '12:00',
      }, mockContext);

      expect(result.available).toBe(true);
      expect(result.conflicts).toHaveLength(0);
    });

    it('deve retornar não disponível se houver reserva conflitante', async () => {
      mockPrisma.commonArea.findFirst.mockResolvedValue(mockArea);
      mockPrisma.reservation.findMany.mockResolvedValue(mockReservations);

      const result = await service.checkAvailability('area-uuid-001', {
        date: '2026-06-15',
        startTime: '15:00',
        endTime: '17:00',
      }, mockContext);

      expect(result.available).toBe(false);
      expect(result.conflicts).toHaveLength(1);
      expect(result.conflicts[0]).toMatchObject({
        startTime: '14:00',
        endTime: '16:00',
      });
    });

    it('deve retornar disponível se reserva não conflitar (antes do início)', async () => {
      mockPrisma.commonArea.findFirst.mockResolvedValue(mockArea);
      mockPrisma.reservation.findMany.mockResolvedValue([]);

      const result = await service.checkAvailability('area-uuid-001', {
        date: '2026-06-15',
        startTime: '08:00',
        endTime: '10:00',
      }, mockContext);

      expect(result.available).toBe(true);
    });

    it('deve retornar disponível se reserva não conflitar (depois do fim)', async () => {
      mockPrisma.commonArea.findFirst.mockResolvedValue(mockArea);
      mockPrisma.reservation.findMany.mockResolvedValue([]);

      const result = await service.checkAvailability('area-uuid-001', {
        date: '2026-06-15',
        startTime: '18:00',
        endTime: '20:00',
      }, mockContext);

      expect(result.available).toBe(true);
    });

    it('deve lançar CommonAreaNotFoundException se área não existir', async () => {
      mockPrisma.commonArea.findFirst.mockResolvedValue(null);

      await expect(service.checkAvailability('inexistente', {
        date: '2026-06-15',
        startTime: '10:00',
        endTime: '12:00',
      }, mockContext)).rejects.toThrow(CommonAreaNotFoundException);
    });

    it('deve lançar TenantAccessDeniedException se área for de outro condomínio', async () => {
      const areaOutroCondo = { ...mockArea, condominiumId: 'outro-condo' };
      mockPrisma.commonArea.findFirst.mockResolvedValue(areaOutroCondo);

      await expect(service.checkAvailability('area-uuid-001', {
        date: '2026-06-15',
        startTime: '10:00',
        endTime: '12:00',
      }, mockContext)).rejects.toThrow(TenantAccessDeniedException);
    });

    it('deve lançar erro se área estiver em manutenção', async () => {
      mockPrisma.commonArea.findFirst.mockResolvedValue({
        ...mockArea,
        isUnderMaintenance: true,
      });

      await expect(service.checkAvailability('area-uuid-001', {
        date: '2026-06-15',
        startTime: '10:00',
        endTime: '12:00',
      }, mockContext)).rejects.toThrow(CommonAreaValidationException);
    });

    it('deve lançar erro se data for fora dos dias operacionais', async () => {
      mockPrisma.commonArea.findFirst.mockResolvedValue({
        ...mockArea,
        operatingDays: '1,2,3,4,5',
      });

      await expect(service.checkAvailability('area-uuid-001', {
        date: '2026-06-14',
        startTime: '10:00',
        endTime: '12:00',
      }, mockContext)).rejects.toThrow(CommonAreaValidationException);
    });

    it('deve lançar erro se horário solicitado for antes da abertura', async () => {
      mockPrisma.commonArea.findFirst.mockResolvedValue(mockArea);

      await expect(service.checkAvailability('area-uuid-001', {
        date: '2026-06-15',
        startTime: '06:00',
        endTime: '08:00',
      }, mockContext)).rejects.toThrow(CommonAreaValidationException);
    });

    it('deve lançar erro se horário solicitado for depois do fechamento', async () => {
      mockPrisma.commonArea.findFirst.mockResolvedValue(mockArea);

      await expect(service.checkAvailability('area-uuid-001', {
        date: '2026-06-15',
        startTime: '22:00',
        endTime: '23:00',
      }, mockContext)).rejects.toThrow(CommonAreaValidationException);
    });

    it('deve lançar erro se startTime for maior ou igual a endTime', async () => {
      mockPrisma.commonArea.findFirst.mockResolvedValue(mockArea);

      await expect(service.checkAvailability('area-uuid-001', {
        date: '2026-06-15',
        startTime: '14:00',
        endTime: '13:00',
      }, mockContext)).rejects.toThrow(CommonAreaValidationException);
    });

    it('deve lançar erro se RESIDENT não tiver condominiumId', async () => {
      const contextSemCondo = { role: 'RESIDENT', condominiumId: null, userId: 'user-id' };

      await expect(service.checkAvailability('area-uuid-001', {
        date: '2026-06-15',
        startTime: '10:00',
        endTime: '12:00',
      }, contextSemCondo as any)).rejects.toThrow(CommonAreaAccessDeniedException);
    });

    it('deve consultar reservas com status PENDING e APPROVED', async () => {
      mockPrisma.commonArea.findFirst.mockResolvedValue(mockArea);
      mockPrisma.reservation.findMany.mockResolvedValue([]);

      await service.checkAvailability('area-uuid-001', {
        date: '2026-06-15',
        startTime: '10:00',
        endTime: '12:00',
      }, mockContext);

      expect(mockPrisma.reservation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: { in: ['PENDING', 'APPROVED'] },
          }),
        }),
      );
    });
  });

  describe('deleteCommonArea', () => {
    it('deve deletar área que não tem reservas ativas', async () => {
      mockPrisma.commonArea.findFirst.mockResolvedValue(mockCommonArea);
      mockPrisma.reservation.count.mockResolvedValue(0);
      mockPrisma.commonArea.delete.mockResolvedValue(mockCommonArea);

      await expect(service.deleteCommonArea('area-uuid-001', mockContext))
        .resolves.not.toThrow();

      expect(mockPrisma.commonArea.delete).toHaveBeenCalledWith({
        where: { id: 'area-uuid-001' },
      });
    });

    it('deve lançar CommonAreaNotFoundException se área não existir', async () => {
      mockPrisma.commonArea.findFirst.mockResolvedValue(null);

      await expect(service.deleteCommonArea('inexistente', mockContext))
        .rejects.toThrow(CommonAreaNotFoundException);
    });

    it('deve lançar CommonAreaHasReservationsException se tiver reservas ativas', async () => {
      mockPrisma.commonArea.findFirst.mockResolvedValue(mockCommonArea);
      mockPrisma.reservation.count.mockResolvedValue(3);

      await expect(service.deleteCommonArea('area-uuid-001', mockContext))
        .rejects.toThrow(CommonAreaHasReservationsException);
    });

    it('deve deletar área que só tem reservas CANCELED', async () => {
      mockPrisma.commonArea.findFirst.mockResolvedValue(mockCommonArea);
      mockPrisma.reservation.count.mockResolvedValue(0);
      mockPrisma.commonArea.delete.mockResolvedValue(mockCommonArea);

      await expect(service.deleteCommonArea('area-uuid-001', mockContext))
        .resolves.not.toThrow();
    });

    it('deve lançar TenantAccessDeniedException se área for de outro condomínio', async () => {
      const areaOutroCondo = { ...mockCommonArea, condominiumId: 'outro-condo' };
      mockPrisma.commonArea.findFirst.mockResolvedValue(areaOutroCondo);

      await expect(service.deleteCommonArea('area-uuid-001', mockContext))
        .rejects.toThrow(TenantAccessDeniedException);
    });

    it('deve lançar CommonAreaAccessDeniedException se não for ADMIN', async () => {
      await expect(service.deleteCommonArea('area-uuid-001', mockResidentContext))
        .rejects.toThrow(CommonAreaAccessDeniedException);
    });
  });
});
