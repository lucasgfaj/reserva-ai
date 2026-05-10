/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

interface AuthUser {
  sub: string;
  email: string;
  role: string;
  condominiumId: string;
}

declare module 'express' {
  interface Request {
    user?: AuthUser;
  }
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    
    // Tenta pegar token do cookie primeiro, depois do header Authorization
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Token não fornecido');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      request.user = payload as AuthUser;
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado');
    }

    return true;
  }

  private extractToken(request: Request): string | undefined {
    // 1. Tenta do cookie (preferencial)
    const cookieToken = request.cookies?.access_token;
    if (cookieToken) {
      return cookieToken;
    }

    // 2. Tenta do header Authorization (fallback para APIs externas)
    const authHeader = request.headers.authorization;
    if (authHeader) {
      const [type, token] = authHeader.split(' ');
      if (type === 'Bearer' && token) {
        return token;
      }
    }

    return undefined;
  }
}
/* eslint-enable @typescript-eslint/no-unsafe-assignment */
