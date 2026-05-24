import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Request,
  UseGuards,
  UseInterceptors,
  UseFilters,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
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
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import {
  AnnouncementListOutput,
  AnnouncementCreatedOutput,
} from './interfaces/announcement.interface';

interface AuthRequest {
  user: {
    sub: string;
    email: string;
    role: string;
    condominiumId: string;
  };
}

@ApiTags('announcements')
@ApiBearerAuth()
@Controller('announcements')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TransformInterceptor)
@UseFilters(DomainExceptionFilter)
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(new RolesGuard([Role.ADMIN]))
  @ApiOperation({ summary: 'Criar comunicado (Admin)' })
  @ApiResponse({ status: 201, description: 'Comunicado criado.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Apenas administradores.' })
  async create(
    @Body() dto: CreateAnnouncementDto,
    @Request() req: AuthRequest,
  ): Promise<AnnouncementCreatedOutput> {
    return this.announcementsService.create(dto, {
      role: req.user.role,
      condominiumId: req.user.condominiumId,
      userId: req.user.sub,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Listar comunicados do condomínio' })
  @ApiResponse({ status: 200, description: 'Lista de comunicados.' })
  async findAll(
    @Request() req: AuthRequest,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ): Promise<AnnouncementListOutput> {
    return this.announcementsService.list({
      role: req.user.role,
      condominiumId: req.user.condominiumId,
      userId: req.user.sub,
      page,
      limit,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(new RolesGuard([Role.ADMIN]))
  @ApiOperation({ summary: 'Remover comunicado (Admin)' })
  @ApiParam({ name: 'id', description: 'UUID do comunicado' })
  @ApiResponse({ status: 200, description: 'Comunicado removido.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Apenas administradores.' })
  @ApiResponse({ status: 404, description: 'Comunicado não encontrado.' })
  async delete(
    @Param('id') id: string,
    @Request() req: AuthRequest,
  ): Promise<{ message: string }> {
    return this.announcementsService.delete(id, {
      role: req.user.role,
      condominiumId: req.user.condominiumId,
      userId: req.user.sub,
    });
  }
}
