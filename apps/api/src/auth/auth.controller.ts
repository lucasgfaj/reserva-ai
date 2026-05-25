import { Controller, Post, Patch, Body, HttpCode, HttpStatus, Res, Request, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import type { Request as ExpressRequest } from 'express';
import type { RegisterTenantOutput, LoginOutput } from './interfaces/auth.interface';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterTenantDto } from './dto/register-tenant.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { setAuthCookie, clearAuthCookie } from './utils/cookie.utils';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'US01 - Registrar condomínio e administrador raiz',
    description: `
      **[US01]** Cria de forma atômica o condomínio e o usuário administrador raiz (Self-Service Onboarding).
      
      **Acesso:** Público (não requer autenticação)
      **Regras de negócio:** RN02
      
      **Exemplo de cURL:**
      \`\`\`bash
      curl -X POST http://localhost:3000/api/v1/auth/register \\
        -H "Content-Type: application/json" \\
        -c cookies.txt \\
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
    description: 'Condomínio e Admin criados com sucesso. Cookie HttpOnly definido.',
  })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos.' })
  @ApiResponse({ status: 409, description: 'E-mail já cadastrado.' })
  async register(
    @Body() input: RegisterTenantDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<RegisterTenantOutput> {
    const result = await this.authService.registerTenant(input);
    setAuthCookie(response, result.accessToken);
    return result;
  }

  @Post('login')
  @ApiOperation({
    summary: 'US02/US03.1 - Login de administrador ou morador',
    description: `
      **[US02]** Login de administrador para gerenciar dados do condomínio.
      **[US03.1]** Login de morador com credenciais fornecidas pelo administrador.
      
      **Acesso:** Público (não requer autenticação)
      
      **Exemplo de cURL (com cookies):**
      \`\`\`bash
      curl -X POST http://localhost:3000/api/v1/auth/login \\
        -H "Content-Type: application/json" \\
        -c cookies.txt \\
        -d '{"email": "admin@reservaai.com.br", "password": "SenhaSegura123!"}'
      \`\`\`
    `,
  })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso.' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas.' })
  async login(
    @Body() input: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginOutput> {
    const result = await this.authService.login(input);
    setAuthCookie(response, result.accessToken);
    return result;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Logout - Invalidar sessão',
    description: `
      Invalida a sessão do usuário limpando o cookie HttpOnly.
      
      **Acesso:** Autenticado (requer JWT)
      
      **Exemplo de cURL:**
      \`\`\`bash
      curl -X POST http://localhost:3000/api/v1/auth/logout \\
        -b cookies.txt \\
        -c cookies.txt
      \`\`\`
    `,
  })
  @ApiResponse({ status: 200, description: 'Logout realizado com sucesso. Cookie limpo.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  logout(@Res({ passthrough: true }) response: Response) {
    clearAuthCookie(response);
    return { message: 'Logout realizado com sucesso' };
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Atualizar perfil do usuário autenticado',
    description: `
      Atualiza nome e/ou e-mail do usuário autenticado.
      
      **Acesso:** Autenticado (requer JWT)
    `,
  })
  @ApiResponse({ status: 200, description: 'Perfil atualizado.' })
  @ApiResponse({ status: 409, description: 'E-mail já em uso.' })
  async updateProfile(
    @Body() dto: UpdateProfileDto,
    @Request() req: ExpressRequest,
  ): Promise<{ id: string; name: string; email: string; role: string }> {
    const user = req.user as { sub: string };
    return this.authService.updateProfile(user.sub, dto);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Alterar senha do usuário autenticado',
    description: `
      Altera a senha do usuário autenticado.
      
      **Acesso:** Autenticado (requer JWT)
      
      **Exemplo de cURL:**
      \`\`\`bash
      curl -X PATCH http://localhost:3000/api/v1/auth/change-password \\
        -H "Content-Type: application/json" \\
        -b cookies.txt \\
        -d '{"currentPassword": "SenhaAtual123!", "newPassword": "NovaSenha456!"}'
      \`\`\`
    `,
  })
  @ApiResponse({ status: 200, description: 'Senha alterada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Senha atual incorreta ou dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  async changePassword(
    @Body() dto: ChangePasswordDto,
    @Request() req: ExpressRequest,
  ): Promise<{ message: string }> {
    const user = req.user as { sub: string };
    return this.authService.changePassword(user.sub, dto.currentPassword, dto.newPassword);
  }
}
