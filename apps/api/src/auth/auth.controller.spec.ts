import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterTenantDto } from './dto/register-tenant.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockRegisterResult = {
    access_token: 'mock-jwt-token',
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

  const registerDto: RegisterTenantDto = {
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
      const result = await controller.register(registerDto);

      expect(service.registerTenant).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(mockRegisterResult);
    });

    it('should return access_token, user, and condominium', async () => {
      const result = await controller.register(registerDto);

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('condominium');
      expect(result.user.email).toBe(registerDto.adminEmail);
      expect(result.condominium.name).toBe(registerDto.condominiumName);
    });
  });
});