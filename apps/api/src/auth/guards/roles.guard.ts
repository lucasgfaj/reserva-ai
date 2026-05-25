import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

interface AuthUser {
  sub: string;
  email: string;
  role: string;
  condominiumId: string;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly allowedRoles: string[]) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user: AuthUser | undefined = (request as any).user;

    if (!user) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    if (!this.allowedRoles.includes(user.role)) {
      throw new ForbiddenException('Acesso deny. Permissão insuficiente.');
    }

    return true;
  }
}
