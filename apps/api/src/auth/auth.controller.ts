import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import type {
  RegisterTenantOutput,
  LoginOutput,
} from './interfaces/auth.interface';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterTenantDto } from './dto/register-tenant.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Registra um novo condomínio e seu administrador raiz',
    description: `
      Cria de forma atômica o condomínio e o usuário administrador vinculado.
      
      **Exemplo de cURL:**
      \`\`\`bash
      curl -X POST http://localhost:3000/api/v1/auth/register \\
        -H "Content-Type: application/json" \\
        -d '{
          "adminName": "Lucas Admin",
          "adminEmail": "admin@reservaai.com.br",
          "adminPassword": "SenhaSegura123!",
          "condominiumName": "Residencial Horizonte",
          "condominiumAddress": "Rua das Flores, 123"
        }'
      \`\`\`
    `,
  })
  @ApiResponse({
    status: 201,
    description: 'Condomínio e Admin criados com sucesso.',
  })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos.' })
  @ApiResponse({ status: 409, description: 'E-mail já cadastrado.' })
  async register(
    @Body() input: RegisterTenantDto,
  ): Promise<RegisterTenantOutput> {
    return this.authService.registerTenant(input);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Realiza login de administrador ou morador',
description: `
      Autentica o administrador ou morador e retorna um JWT token.
      O morador deve usar as credenciais fornecidas pelo administrador do condomínio.
      
      **Exemplo de cURL (Admin):**
      \`\`\`bash
      curl -X POST http://localhost:3000/api/v1/auth/login \\
        -H "Content-Type: application/json" \\
        -d '{
          "email": "admin@reservaai.com.br",
          "password": "SenhaSegura123!"
        }'
      \`\`\`

      **Exemplo de cURL (Morador):**
      \`\`\`bash
      curl -X POST http://localhost:3000/api/v1/auth/login \\
        -H "Content-Type: application/json" \\
        -d '{
          "email": "morador@reservaai.com.br",
          "password": "Senha123"
        }'
      \`\`\`
    `,
  })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso.' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas.' })
  async login(@Body() input: LoginDto): Promise<LoginOutput> {
    return this.authService.login(input);
  }

  @Post('logout')
  @ApiOperation({
    summary: 'Realiza logout do usuário',
    description: `
      Invalida a sessão do usuário.
      
      **Exemplo de cURL:**
      \`\`\`bash
      curl -X POST http://localhost:3000/api/v1/auth/logout \\
        -H "Authorization: Bearer <token>"
      \`\`\`
    `,
  })
  @ApiResponse({ status: 200, description: 'Logout realizado com sucesso.' })
  logout() {
    return { message: 'Logout realizado com sucesso' };
  }
}
