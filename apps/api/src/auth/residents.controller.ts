import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Request,
  UseGuards,
} from '@nestjs/common';
import type { CreateResidentOutput } from './interfaces/auth.interface';
import { AuthService } from './auth.service';
import { CreateResidentDto } from './dto/create-resident.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';

interface AuthRequest {
  user: {
    sub: string;
    email: string;
    role: string;
    condominiumId: string;
  };
}

@ApiTags('residents')
@Controller('residents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class ResidentsController {
  constructor(private readonly authService: AuthService) {}

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
      curl -X POST http://localhost:3000/api/v1/residents \\
        -H "Content-Type: application/json" \\
        -H "Authorization: Bearer <token_admin>" \\
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
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Apenas administradores podem cadastrar.' })
  @ApiResponse({ status: 409, description: 'E-mail já cadastrado.' })
  async create(
    @Body() input: CreateResidentDto,
    @Request() req: AuthRequest,
  ): Promise<CreateResidentOutput> {
    return this.authService.createResident(input, {
      userId: req.user.sub,
      email: req.user.email,
      role: req.user.role,
      condominiumId: req.user.condominiumId,
    });
  }
}