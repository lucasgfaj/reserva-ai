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
  ApiQuery,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TransformInterceptor } from '../common/interceptors/transform.interceptor';
import { DomainExceptionFilter } from '../common/filters/domain-exception.filter';
import { UnitsService } from './units.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import {
  UnitListOutput,
  UnitOutput,
  UnitCreatedOutput,
  UnitUpdatedOutput,
  UnitDeletedOutput,
} from './interfaces/units.interface';

interface AuthRequest {
  user: {
    sub: string;
    email: string;
    role: string;
    condominiumId: string;
  };
}

@ApiTags('units')
@ApiBearerAuth()
@Controller('units')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TransformInterceptor)
@UseFilters(DomainExceptionFilter)
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar unidades do condomínio',
    description: 'Lista todas as unidades do condomínio ordenadas por número. Pode filtrar por bloco.',
  })
  @ApiQuery({ name: 'blockId', required: false, description: 'Filtrar por UUID do bloco' })
  @ApiResponse({ status: 200, description: 'Lista de unidades retornada com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  async findAll(
    @Request() req: AuthRequest,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('blockId') blockId?: string,
  ): Promise<UnitListOutput> {
    return this.unitsService.list({
      role: req.user.role,
      condominiumId: req.user.condominiumId,
      userId: req.user.sub,
      page,
      limit,
      blockId,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar unidade pelo ID' })
  @ApiParam({ name: 'id', description: 'UUID da unidade' })
  @ApiResponse({ status: 200, description: 'Unidade encontrada.' })
  @ApiResponse({ status: 404, description: 'Unidade não encontrada.' })
  async findOne(
    @Param('id') id: string,
    @Request() req: AuthRequest,
  ): Promise<UnitOutput> {
    return this.unitsService.getById(id, {
      role: req.user.role,
      condominiumId: req.user.condominiumId,
      userId: req.user.sub,
    });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(new RolesGuard([Role.ADMIN]))
  @ApiOperation({ summary: 'Criar unidade (Admin)' })
  @ApiResponse({ status: 201, description: 'Unidade criada com sucesso.' })
  @ApiResponse({ status: 409, description: 'Já existe unidade com este número.' })
  async create(
    @Body() dto: CreateUnitDto,
    @Request() req: AuthRequest,
  ): Promise<UnitCreatedOutput> {
    return this.unitsService.create(dto, {
      role: req.user.role,
      condominiumId: req.user.condominiumId,
      userId: req.user.sub,
    });
  }

  @Patch(':id')
  @UseGuards(new RolesGuard([Role.ADMIN]))
  @ApiOperation({ summary: 'Atualizar unidade (Admin)' })
  @ApiParam({ name: 'id', description: 'UUID da unidade' })
  @ApiResponse({ status: 200, description: 'Unidade atualizada com sucesso.' })
  @ApiResponse({ status: 404, description: 'Unidade não encontrada.' })
  @ApiResponse({ status: 409, description: 'Já existe unidade com este número.' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUnitDto,
    @Request() req: AuthRequest,
  ): Promise<UnitUpdatedOutput> {
    return this.unitsService.update(id, dto, {
      role: req.user.role,
      condominiumId: req.user.condominiumId,
      userId: req.user.sub,
    });
  }

  @Delete(':id')
  @UseGuards(new RolesGuard([Role.ADMIN]))
  @ApiOperation({ summary: 'Remover unidade (Admin)' })
  @ApiParam({ name: 'id', description: 'UUID da unidade' })
  @ApiResponse({ status: 200, description: 'Unidade removida com sucesso.' })
  @ApiResponse({ status: 404, description: 'Unidade não encontrada.' })
  @ApiResponse({ status: 409, description: 'Unidade possui moradores vinculados.' })
  async delete(
    @Param('id') id: string,
    @Request() req: AuthRequest,
  ): Promise<UnitDeletedOutput> {
    return this.unitsService.delete(id, {
      role: req.user.role,
      condominiumId: req.user.condominiumId,
      userId: req.user.sub,
    });
  }
}
