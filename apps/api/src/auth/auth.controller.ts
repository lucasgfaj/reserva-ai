import { Controller, Post, Body } from '@nestjs/common';
import type {
  RegisterTenantInput,
  RegisterTenantOutput,
  LoginOutput,
} from './interfaces/auth.interface';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
    `,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        adminName: { type: 'string', example: 'Lucas Admin' },
        adminEmail: { type: 'string', example: 'admin@reservaai.com.br' },
        adminPassword: { type: 'string', example: 'SenhaSegura123!' },
        condominiumName: { type: 'string', example: 'Residencial Horizonte' },
        condominiumAddress: { type: 'string', example: 'Rua das Flores, 123' },
      },
      required: [
        'adminName',
        'adminEmail',
        'adminPassword',
        'condominiumName',
        'condominiumAddress',
      ],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Condomínio e Admin criados com sucesso.',
  })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos.' })
  @ApiResponse({ status: 409, description: 'E-mail já cadastrado.' })
  async register(
    @Body() input: RegisterTenantInput,
  ): Promise<RegisterTenantOutput> {
    return this.authService.registerTenant(input);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Realiza login do administrador do condomínio (US02)',
    description: `
      Autentica o usuário e retorna um JWT token.
      
      **Exemplo de cURL:**
      \`\`\`bash
      curl -X POST http://localhost:3000/api/v1/auth/login \\
        -H "Content-Type: application/json" \\
        -d '{
          "email": "admin@reservaai.com.br",
          "password": "SenhaSegura123!"
        }'
      \`\`\`
    `,
  })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso.' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas.' })
  async login(@Body() input: LoginDto): Promise<LoginOutput> {
    return this.authService.login(input);
  }
}
