import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let jwtService: JwtService;

  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    jwtService = module.get<JwtService>(JwtService);
  });

  function mockContext(cookies?: Record<string, string>, authHeader?: string) {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          cookies: cookies || {},
          headers: { authorization: authHeader },
        }),
      }),
    } as any;
  }

  describe('canActivate', () => {
    it('should return true when token is valid in cookie', async () => {
      const payload = { sub: 'user-id', email: 'test@test.com', role: 'ADMIN', condominiumId: 'condo-id' };
      mockJwtService.verifyAsync.mockResolvedValue(payload);

      const result = await guard.canActivate(mockContext({ access_token: 'valid-token' }));

      expect(result).toBe(true);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-token');
    });

    it('should return true when token is valid in Authorization header', async () => {
      const payload = { sub: 'user-id', email: 'test@test.com', role: 'ADMIN', condominiumId: 'condo-id' };
      mockJwtService.verifyAsync.mockResolvedValue(payload);

      const result = await guard.canActivate(mockContext({}, 'Bearer valid-token'));

      expect(result).toBe(true);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-token');
    });

    it('should throw UnauthorizedException when no token provided', async () => {
      await expect(guard.canActivate(mockContext({}))).rejects.toThrow(UnauthorizedException);
      await expect(guard.canActivate(mockContext({}))).rejects.toThrow('Token não fornecido');
    });

    it('should throw UnauthorizedException when token is invalid', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error('invalid'));

      await expect(guard.canActivate(mockContext({ access_token: 'invalid-token' }))).rejects.toThrow(UnauthorizedException);
      await expect(guard.canActivate(mockContext({ access_token: 'invalid-token' }))).rejects.toThrow('Token inválido ou expirado');
    });

    it('should throw UnauthorizedException when Authorization header has no Bearer prefix', async () => {
      await expect(guard.canActivate(mockContext({}, 'Basic token'))).rejects.toThrow('Token não fornecido');
    });

    it('should prefer cookie over Authorization header', async () => {
      const payload = { sub: 'cookie-user', email: 'cookie@test.com', role: 'ADMIN', condominiumId: 'condo-id' };
      mockJwtService.verifyAsync.mockResolvedValue(payload);

      const result = await guard.canActivate(mockContext({ access_token: 'cookie-token' }, 'Bearer header-token'));

      expect(result).toBe(true);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith('cookie-token');
    });
  });
});