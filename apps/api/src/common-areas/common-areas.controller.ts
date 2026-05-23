import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
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
  ApiParam,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TransformInterceptor } from '../common/interceptors/transform.interceptor';
import { DomainExceptionFilter } from '../common/filters/domain-exception.filter';
import { CommonAreasService } from './common-areas.service';
import { CreateCommonAreaDto } from './dto/create-common-area.dto';
import { UpdateCommonAreaDto } from './dto/update-common-area.dto';
import {
  CommonAreaListOutput,
  CommonAreaDetailOutput,
  CommonAreaCreatedOutput,
  CommonAreaUpdatedOutput,
  CommonAreaDeletedOutput,
} from './interfaces/common-areas.interface';

interface AuthRequest {
  user: {
    sub: string;
    email: string;
    role: string;
    condominiumId: string;
  };
}

@ApiTags('common-areas')
@ApiBearerAuth()
@Controller('common-areas')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TransformInterceptor)
@UseFilters(DomainExceptionFilter)
export class CommonAreasController {
  constructor(private readonly commonAreasService: CommonAreasService) {}

  @Get()
  @ApiOperation({
    summary: 'US05 - Listar áreas comuns do condomínio',
    description: `
      **[US05]** Lista todas as áreas comuns disponíveis no condomínio.
      
      **Acesso:** Administradores (ADMIN) e Moradores (RESIDENT)
      **Regras de negócio:** RN01 (isolamento por condomínio)
      
      Retorna áreas ordenadas alfabeticamente por nome.
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de áreas comuns retornada com sucesso.',
  })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({
    status: 403,
    description: 'Super Admin sem condomínio vinculado.',
  })
  async findAll(
    @Request() req: AuthRequest,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<CommonAreaListOutput> {
    return this.commonAreasService.listCommonAreas({
      role: req.user.role,
      condominiumId: req.user.condominiumId,
      userId: req.user.sub,
      page,
      limit,
    });
  }

  @Get(':id')
  @ApiOperation({
    summary: 'US05 - Buscar área comum pelo ID',
    description: `
      **[US05]** Busca os detalhes de uma área comum específica.
      
      **Acesso:** Administradores (ADMIN) e Moradores (RESIDENT)
      **Regras de negócio:** RN01, RN03.1 (horário de funcionamento)
    `,
  })
  @ApiParam({ name: 'id', description: 'UUID da área comum' })
  @ApiResponse({
    status: 200,
    description: 'Área comum encontrada.',
  })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({
    status: 403,
    description: 'Área pertencente a outro condomínio.',
  })
  @ApiResponse({ status: 404, description: 'Área comum não encontrada.' })
  async findOne(
    @Param('id') id: string,
    @Request() req: AuthRequest,
  ): Promise<CommonAreaDetailOutput> {
    return this.commonAreasService.getCommonAreaById(id, {
      role: req.user.role,
      condominiumId: req.user.condominiumId,
      userId: req.user.sub,
    });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(new RolesGuard([Role.ADMIN]))
  @ApiOperation({
    summary: 'US04 - Cadastrar área comum (Admin)',
    description: `
      **[US04]** Cadastra e gerencia áreas comuns disponíveis para reserva.
      
      **Acesso:** Apenas administradores (ROLE.ADMIN)
      **Regras de negócio:** RN01, RN03, RN03.1
      
      **Horário de funcionamento:** openTime e closeTime no formato HH:MM (ex: 08:00, 22:00)
      **Dias de funcionamento:** Lista de 1 a 7 separados por vírgula (1=Domingo a 7=Sábado)
    `,
  })
  @ApiResponse({
    status: 201,
    description: 'Área comum criada com sucesso.',
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
  @ApiResponse({
    status: 409,
    description: 'Já existe área comum com este nome.',
  })
  async create(
    @Body() input: CreateCommonAreaDto,
    @Request() req: AuthRequest,
  ): Promise<CommonAreaCreatedOutput> {
    return this.commonAreasService.createCommonArea(input, {
      role: req.user.role,
      condominiumId: req.user.condominiumId,
      userId: req.user.sub,
    });
  }

  @Patch(':id')
  @UseGuards(new RolesGuard([Role.ADMIN]))
  @ApiOperation({
    summary: 'US04 - Atualizar área comum (Admin)',
    description: `
      **[US04]** Atualiza os dados de uma área comum existente.
      
      **Acesso:** Apenas administradores (ROLE.ADMIN)
      **Regras de negócio:** RN01 (isolamento por condomínio)
    `,
  })
  @ApiParam({ name: 'id', description: 'UUID da área comum' })
  @ApiResponse({
    status: 200,
    description: 'Área comum atualizada com sucesso.',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados de entrada inválidos.',
  })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({
    status: 403,
    description: 'Apenas administradores podem atualizar.',
  })
  @ApiResponse({ status: 404, description: 'Área comum não encontrada.' })
  @ApiResponse({
    status: 409,
    description: 'Já existe área comum com este nome.',
  })
  async update(
    @Param('id') id: string,
    @Body() input: UpdateCommonAreaDto,
    @Request() req: AuthRequest,
  ): Promise<CommonAreaUpdatedOutput> {
    return this.commonAreasService.updateCommonArea(id, input, {
      role: req.user.role,
      condominiumId: req.user.condominiumId,
      userId: req.user.sub,
    });
  }

  @Delete(':id')
  @UseGuards(new RolesGuard([Role.ADMIN]))
  @ApiOperation({
    summary: 'US04 - Deletar área comum (Admin)',
    description: `
      **[US04]** Deleta uma área comum do condomínio.
      
      **Acesso:** Apenas administradores (ROLE.ADMIN)
      **Regras de negócio:** RN04 (não usar exclusão física)
      
      **Restrição:** Só é possível deletar áreas sem reservas ativas (PENDING ou APPROVED).
    `,
  })
  @ApiParam({ name: 'id', description: 'UUID da área comum' })
  @ApiResponse({
    status: 200,
    description: 'Área comum deletada com sucesso.',
  })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({
    status: 403,
    description: 'Apenas administradores podem deletar.',
  })
  @ApiResponse({ status: 404, description: 'Área comum não encontrada.' })
  @ApiResponse({
    status: 409,
    description: 'Área comum possui reservas ativas.',
  })
  async delete(
    @Param('id') id: string,
    @Request() req: AuthRequest,
  ): Promise<CommonAreaDeletedOutput> {
    return this.commonAreasService.deleteCommonArea(id, {
      role: req.user.role,
      condominiumId: req.user.condominiumId,
      userId: req.user.sub,
    });
  }
}
