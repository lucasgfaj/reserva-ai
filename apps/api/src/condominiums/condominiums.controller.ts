import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  UseInterceptors,
  UseFilters,
  Request,
  HttpCode,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TransformInterceptor } from '../common/interceptors/transform.interceptor';
import { DomainExceptionFilter } from '../common/filters/domain-exception.filter';
import { CondominiumsService } from './condominiums.service';
import { UpdateCondominiumDto } from './dto/update-condominium.dto';
import { CondominiumOutput } from './interfaces/condominium.interface';

interface AuthRequest {
  user: {
    sub: string;
    email: string;
    role: string;
    condominiumId: string;
  };
}

@ApiTags('condominiums')
@ApiBearerAuth()
@Controller('condominiums')
@UseGuards(JwtAuthGuard, new RolesGuard([Role.ADMIN]))
@UseInterceptors(TransformInterceptor)
@UseFilters(DomainExceptionFilter)
export class CondominiumsController {
  constructor(private readonly condominiumsService: CondominiumsService) {}

  @Get()
  @ApiOperation({
    summary: 'US02 - Obter dados do condomínio atual',
    description: 'Retorna os dados do condomínio do administrador autenticado.',
  })
  @ApiResponse({ status: 200, description: 'Dados do condomínio.' })
  async findCurrent(
    @Request() req: AuthRequest,
  ): Promise<CondominiumOutput> {
    return this.condominiumsService.findCurrent({
      role: req.user.role,
      condominiumId: req.user.condominiumId,
    });
  }

  @Patch()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'US02 - Atualizar dados do condomínio',
    description: 'Atualiza os dados do condomínio do administrador autenticado.',
  })
  @ApiResponse({ status: 200, description: 'Condomínio atualizado.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 404, description: 'Condomínio não encontrado.' })
  async update(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    input: UpdateCondominiumDto,
    @Request() req: AuthRequest,
  ): Promise<CondominiumOutput> {
    return this.condominiumsService.update(input, {
      role: req.user.role,
      condominiumId: req.user.condominiumId,
    });
  }
}
