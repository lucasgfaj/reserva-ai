import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UseFilters,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TransformInterceptor } from '../common/interceptors/transform.interceptor';
import { DomainExceptionFilter } from '../common/filters/domain-exception.filter';
import { ResidentsService } from './residents.service';
import { CreateResidentDto } from './dto/create-resident.dto';
import { UpdatePermissionsDto } from './dto/update-permissions.dto';
import {
  ResidentListOutput,
  ResidentDetailOutput,
  UpdateResidentPermissionsOutput,
  CreateResidentOutput,
} from './interfaces/residents.interface';

interface AuthRequest {
  user: {
    sub: string;
    email: string;
    role: string;
    condominiumId: string;
  };
}

@ApiTags('residents')
@ApiBearerAuth()
@Controller('residents')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TransformInterceptor)
@UseFilters(DomainExceptionFilter)
export class ResidentsController {
  constructor(private readonly residentsService: ResidentsService) {}

  @Get()
  @ApiOperation({
    summary: 'US03 - Listar moradores do condomínio (Admin)',
    description: `
      **[US03]** Lista todos os moradores vinculados ao condomínio do administrador.
      
      **Acesso:** Apenas administradores (ROLE.ADMIN)
      **Regras de negócio:** RN01 (isolamento por condomínio)
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de moradores retornada com sucesso.',
  })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({
    status: 403,
    description: 'Apenas administradores podem listar.',
  })
  async findAll(@Request() req: AuthRequest): Promise<ResidentListOutput> {
    return this.residentsService.listResidents({
      role: req.user.role,
      condominiumId: req.user.condominiumId,
    });
  }

  @Get(':id')
  @ApiOperation({
    summary: 'US03 - Buscar morador pelo ID (Admin)',
    description: `
      **[US03]** Busca os detalhes de um morador específico.
      
      **Acesso:** Apenas administradores (ROLE.ADMIN)
      **Regras de negócio:** RN01 (isolamento por condomínio)
    `,
  })
  @ApiParam({ name: 'id', description: 'UUID do morador' })
  @ApiResponse({
    status: 200,
    description: 'Morador encontrado.',
  })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({
    status: 403,
    description: 'Apenas administradores podem buscar.',
  })
  @ApiResponse({ status: 404, description: 'Morador não encontrado.' })
  async findOne(
    @Param('id') id: string,
    @Request() req: AuthRequest,
  ): Promise<ResidentDetailOutput> {
    return this.residentsService.getResidentById(id, {
      role: req.user.role,
      condominiumId: req.user.condominiumId,
    });
  }

  @Patch(':id/permissions')
  @ApiOperation({
    summary: 'US03 - Alterar permissão de reserva (Admin)',
    description: `
      **[US03]** Permite ao administrador ativar ou desativar o privilégio de reserva (canBook) de um morador.
      
      **Acesso:** Apenas administradores (ROLE.ADMIN)
      **Regras de negócio:** RN01 (isolamento por condomínio)
    `,
  })
  @ApiParam({ name: 'id', description: 'UUID do morador' })
  @ApiResponse({
    status: 200,
    description: 'Permissão atualizada.',
  })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({
    status: 403,
    description: 'Apenas administradores podem alterar.',
  })
  @ApiResponse({ status: 404, description: 'Morador não encontrado.' })
  async updatePermissions(
    @Param('id') id: string,
    @Body() input: UpdatePermissionsDto,
    @Request() req: AuthRequest,
  ): Promise<UpdateResidentPermissionsOutput> {
    return this.residentsService.updateResidentPermissions(id, input.canBook, {
      role: req.user.role,
      condominiumId: req.user.condominiumId,
    });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(new RolesGuard([Role.ADMIN]))
  @ApiOperation({
    summary: 'US03 - Cadastrar morador (Admin)',
    description: `
      **[US03]** Cadastra as credenciais de um novo morador de forma restrita (morador não possui tela de registro livre).
      
      **Acesso:** Apenas administradores (ROLE.ADMIN)
      **Regras de negócio:** RN01, RN01.1, RN01.2
      
      Se password não for fornecida, será gerada automaticamente (8 caracteres).
    `,
  })
  @ApiResponse({
    status: 201,
    description: 'Morador criado com sucesso.',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados de entrada inválidos.',
  })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({
    status: 403,
    description: 'Apenas administradores podem cadastrar.',
  })
  @ApiResponse({ status: 409, description: 'E-mail já cadastrado.' })
  async create(
    @Body() input: CreateResidentDto,
    @Request() req: AuthRequest,
  ): Promise<CreateResidentOutput> {
    return this.residentsService.createResident(input, {
      userId: req.user.sub,
      email: req.user.email,
      role: req.user.role,
      condominiumId: req.user.condominiumId,
    });
  }
}
