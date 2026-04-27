import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterTenantInput } from './interfaces/auth.interface';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockRegisterResult = {
    accessToken: 'mock-jwt-token',
    user: {
      id: 'user-id',
      name: 'Lucas Admin',
      email: 'admin@reservaai.com.br',
      role: 'ADMIN',
    },
    condominium: {
      id: 'condominium-id',
      name: 'Residencial Horizonte',
    },
  };

  const registerInput: RegisterTenantInput = {
    condominiumName: 'Residencial Horizonte',
    condominiumAddress: 'Rua das Flores, 123',
    adminName: 'Lucas Admin',
    adminEmail: 'admin@reservaai.com.br',
    adminPassword: 'SenhaSegura123',
  };

  beforeEach(async () => {
    const mockAuthService = {
      registerTenant: jest.fn().mockResolvedValue(mockRegisterResult),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call AuthService.registerTenant with correct data', async () => {
      const result = await controller.register(registerInput);

      expect(service.registerTenant).toHaveBeenCalledWith(registerInput);
      expect(result).toEqual(mockRegisterResult);
    });

    it('should return accessToken, user, and condominium', async () => {
      const result = await controller.register(registerInput);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('condominium');
      expect(result.user.email).toBe(registerInput.adminEmail);
      expect(result.condominium.name).toBe(registerInput.condominiumName);
    });
  });
});