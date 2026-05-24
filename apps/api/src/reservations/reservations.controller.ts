import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UseFilters,
  Request,
  HttpCode,
  HttpStatus,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TransformInterceptor } from '../common/interceptors/transform.interceptor';
import { DomainExceptionFilter } from '../common/filters/domain-exception.filter';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ReservationOutput, ReservationListOutput } from './interfaces/reservation.interface';

interface AuthRequest {
  user: {
    sub: string;
    email: string;
    role: string;
    condominiumId: string;
  };
}

@ApiTags('reservations')
@ApiBearerAuth()
@Controller('reservations')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TransformInterceptor)
@UseFilters(DomainExceptionFilter)
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get()
  @ApiOperation({
    summary: 'US09/US10 - Listar reservas',
    description: `
      **[US09/US10]** Lista reservas.

      **Acesso:**
      - RESIDENT: lista apenas as próprias reservas
      - ADMIN: lista todas as reservas do condomínio
    `,
  })
  @ApiResponse({ status: 200, description: 'Lista de reservas.' })
  async findAll(
    @Request() req: AuthRequest,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('status') status?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ): Promise<ReservationListOutput> {
    return this.reservationsService.listReservations({
      role: req.user.role,
      condominiumId: req.user.condominiumId,
      userId: req.user.sub,
    }, { page, limit, status, from, to });
  }

  @Patch(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'US08 - Cancelar reserva',
    description: `
      **[US08]** Cancela uma reserva.
      
      **Acesso:**
      - RESIDENT: cancela apenas as próprias reservas
      - ADMIN: cancela qualquer reserva do condomínio
      
      Registra o ID do usuário que cancelou e a data do cancelamento (auditoria).
    `,
  })
  @ApiResponse({ status: 200, description: 'Reserva cancelada com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  @ApiResponse({ status: 404, description: 'Reserva não encontrada.' })
  @ApiResponse({ status: 409, description: 'Reserva já cancelada.' })
  async cancel(
    @Param('id') id: string,
    @Request() req: AuthRequest,
  ): Promise<ReservationOutput> {
    return this.reservationsService.cancelReservation(id, {
      role: req.user.role,
      condominiumId: req.user.condominiumId,
      userId: req.user.sub,
    });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'US07 - Criar uma reserva',
    description: `
      **[US07]** Realiza uma reserva de área comum em um período disponível.
      
      **Acesso:** Moradores (RESIDENT) e Administradores (ADMIN)
      **Regras de negócio:** RN01, RN03, RN03.1
      
      Para RESIDENT, o residentId é obtido automaticamente do token JWT.
      Para ADMIN, pode-se informar o residentId no body.
    `,
  })
  @ApiResponse({ status: 201, description: 'Reserva criada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  @ApiResponse({ status: 404, description: 'Área ou morador não encontrado.' })
  @ApiResponse({ status: 409, description: 'Conflito de horário.' })
  async create(
    @Body() input: CreateReservationDto,
    @Request() req: AuthRequest,
  ): Promise<ReservationOutput> {
    return this.reservationsService.createReservation(input, {
      role: req.user.role,
      condominiumId: req.user.condominiumId,
      userId: req.user.sub,
    });
  }
}
