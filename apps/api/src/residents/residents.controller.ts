import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
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
@UseGuards(JwtAuthGuard, RolesGuard)
export class ResidentsController {
  constructor(private readonly residentsService: ResidentsService) {}

  @Get()
  @ApiOperation({
    summary: 'Lista todos os moradores do condomínio',
    description: `
      Rota protegida para administradores listarem moradores.
      
      **Exemplo de cURL:**
      \`\`\`bash
      curl -X GET http://localhost:3000/api/v1/residents \
        -H "Authorization: Bearer <token_admin>"
      \`\`\`
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
    summary: 'Busca um morador pelo ID',
    description: `
      Rota protegida para admin buscar detalhes de um morador.
      
      **Exemplo de cURL:**
      \`\`\`bash
      curl -X GET http://localhost:3000/api/v1/residents/<uuid> \
        -H "Authorization: Bearer <token_admin>"
      \`\`\`
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
    summary: 'Altera permissão de reserva do morador',
    description: `
      Rota protegida para admin alterar canBook do morador.
      
      **Exemplo de cURL:**
      \`\`\`bash
      curl -X PATCH http://localhost:3000/api/v1/residents/<uuid>/permissions \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer <token_admin>" \
        -d '{"canBook": false}'
      \`\`\`
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
    summary: 'Cadastra um novo morador no condomínio (US03)',
    description: `
      Rota protegida para administradores cadastrarem moradores.
      Se password não for fornecida, será gerada automaticamente (8 caracteres).
      
      **Exemplo de cURL:**
      \`\`\`bash
      curl -X POST http://localhost:3000/api/v1/residents \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer <token_admin>" \
        -d '{
          "name": "João Morador",
          "email": "joao@reservaai.com.br",
          "canBook": true
        }'
      \`\`\`
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
