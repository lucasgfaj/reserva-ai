import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  function mockContext(user?: { role: string }) {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as any;
  }

  describe('canActivate', () => {
    it('should allow access when user has allowed role', () => {
      const guard = new RolesGuard(['ADMIN']);
      expect(guard.canActivate(mockContext({ role: 'ADMIN' }))).toBe(true);
    });

    it('should allow access when user has one of multiple allowed roles', () => {
      const guard = new RolesGuard(['ADMIN', 'RESIDENT']);
      expect(guard.canActivate(mockContext({ role: 'RESIDENT' }))).toBe(true);
    });

    it('should throw ForbiddenException when user role is not allowed', () => {
      const guard = new RolesGuard(['ADMIN']);
      expect(() => guard.canActivate(mockContext({ role: 'RESIDENT' }))).toThrow(ForbiddenException);
      expect(() => guard.canActivate(mockContext({ role: 'RESIDENT' }))).toThrow('Acesso deny. Permissão insuficiente.');
    });

    it('should throw ForbiddenException when user is not authenticated', () => {
      const guard = new RolesGuard(['ADMIN']);
      expect(() => guard.canActivate(mockContext(undefined))).toThrow(ForbiddenException);
      expect(() => guard.canActivate(mockContext(undefined))).toThrow('Usuário não autenticado');
    });

    it('should throw ForbiddenException when user has no role property', () => {
      const guard = new RolesGuard(['ADMIN']);
      expect(() => guard.canActivate(mockContext({} as any))).toThrow('Acesso deny. Permissão insuficiente.');
    });
  });
});