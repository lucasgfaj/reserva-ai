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
import { BlocksService } from './blocks.service';
import { CreateBlockDto } from './dto/create-block.dto';
import { UpdateBlockDto } from './dto/update-block.dto';
import {
  BlockListOutput,
  BlockOutput,
  BlockCreatedOutput,
  BlockUpdatedOutput,
  BlockDeletedOutput,
} from './interfaces/blocks.interface';

interface AuthRequest {
  user: {
    sub: string;
    email: string;
    role: string;
    condominiumId: string;
  };
}

@ApiTags('blocks')
@ApiBearerAuth()
@Controller('blocks')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TransformInterceptor)
@UseFilters(DomainExceptionFilter)
export class BlocksController {
  constructor(private readonly blocksService: BlocksService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar blocos do condomínio',
    description: 'Lista todos os blocos do condomínio ordenados por nome.',
  })
  @ApiResponse({ status: 200, description: 'Lista de blocos retornada com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  async findAll(
    @Request() req: AuthRequest,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<BlockListOutput> {
    return this.blocksService.list({
      role: req.user.role,
      condominiumId: req.user.condominiumId,
      userId: req.user.sub,
      page,
      limit,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar bloco pelo ID' })
  @ApiParam({ name: 'id', description: 'UUID do bloco' })
  @ApiResponse({ status: 200, description: 'Bloco encontrado.' })
  @ApiResponse({ status: 404, description: 'Bloco não encontrado.' })
  async findOne(
    @Param('id') id: string,
    @Request() req: AuthRequest,
  ): Promise<BlockOutput> {
    return this.blocksService.getById(id, {
      role: req.user.role,
      condominiumId: req.user.condominiumId,
      userId: req.user.sub,
    });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(new RolesGuard([Role.ADMIN]))
  @ApiOperation({ summary: 'Criar bloco (Admin)' })
  @ApiResponse({ status: 201, description: 'Bloco criado com sucesso.' })
  @ApiResponse({ status: 409, description: 'Já existe bloco com este nome.' })
  async create(
    @Body() dto: CreateBlockDto,
    @Request() req: AuthRequest,
  ): Promise<BlockCreatedOutput> {
    return this.blocksService.create(dto, {
      role: req.user.role,
      condominiumId: req.user.condominiumId,
      userId: req.user.sub,
    });
  }

  @Patch(':id')
  @UseGuards(new RolesGuard([Role.ADMIN]))
  @ApiOperation({ summary: 'Atualizar bloco (Admin)' })
  @ApiParam({ name: 'id', description: 'UUID do bloco' })
  @ApiResponse({ status: 200, description: 'Bloco atualizado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Bloco não encontrado.' })
  @ApiResponse({ status: 409, description: 'Já existe bloco com este nome.' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBlockDto,
    @Request() req: AuthRequest,
  ): Promise<BlockUpdatedOutput> {
    return this.blocksService.update(id, dto, {
      role: req.user.role,
      condominiumId: req.user.condominiumId,
      userId: req.user.sub,
    });
  }

  @Delete(':id')
  @UseGuards(new RolesGuard([Role.ADMIN]))
  @ApiOperation({ summary: 'Remover bloco (Admin)' })
  @ApiParam({ name: 'id', description: 'UUID do bloco' })
  @ApiResponse({ status: 200, description: 'Bloco removido com sucesso.' })
  @ApiResponse({ status: 404, description: 'Bloco não encontrado.' })
  @ApiResponse({ status: 409, description: 'Bloco possui unidades vinculadas.' })
  async delete(
    @Param('id') id: string,
    @Request() req: AuthRequest,
  ): Promise<BlockDeletedOutput> {
    return this.blocksService.delete(id, {
      role: req.user.role,
      condominiumId: req.user.condominiumId,
      userId: req.user.sub,
    });
  }
}
