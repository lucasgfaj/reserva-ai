import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { Role } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly allowedRoles: Role[]) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request['user'];

    if (!user) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    if (!this.allowedRoles.includes(user.role)) {
      throw new ForbiddenException('Acesso negado. Permissão insuficiente.');
    }

    return true;
  }
}