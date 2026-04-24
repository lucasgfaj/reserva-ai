import { Controller, Post, Body } from '@nestjs/common';
import { RegisterTenantDto } from './dto/register-tenant.dto';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  @ApiOperation({ 
    summary: 'Registra um novo condomínio e seu administrador raiz (US01)',
    description: `
      Cria de forma atômica o condomínio e o usuário administrador vinculado.
      
      **Exemplo de cURL:**
      \`\`\`bash
      curl -X POST http://localhost:3000/api/v1/auth/register \\
        -H "Content-Type: application/json" \\
        -d '{
          "adminName": "Lucas Admin",
          "adminEmail": "admin@reservaai.com.br",
          "adminPassword": "SenhaSegura123",
          "condominiumName": "Residencial Horizonte",
          "condominiumAddress": "Rua das Flores, 123"
        }'
      \`\`\`
    `
  })
  @ApiResponse({ status: 201, description: 'Condomínio e Admin criados com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos.' })
  @ApiResponse({ status: 409, description: 'E-mail já cadastrado.' })
  async register(@Body() registerTenantDto: RegisterTenantDto) {
    return this.authService.registerTenant(registerTenantDto);
  }
}
