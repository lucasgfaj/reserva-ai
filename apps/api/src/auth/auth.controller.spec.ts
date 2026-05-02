import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterTenantInput } from './interfaces/auth.interface';
import { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockRegisterResult = {
    message: 'Registro realizado com sucesso',
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

  const mockLoginResult = {
    message: 'Login realizado com sucesso',
    accessToken: 'mock-jwt-token-login',
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

  const loginInput: LoginDto = {
    email: 'admin@reservaai.com.br',
    password: 'SenhaSegura123',
  };

  beforeEach(async () => {
    const mockAuthService = {
      registerTenant: jest.fn().mockResolvedValue(mockRegisterResult),
      login: jest.fn().mockResolvedValue(mockLoginResult),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  /* eslint-disable @typescript-eslint/unbound-method */
  describe('register', () => {
    it('should call AuthService.registerTenant with correct data', () => {
      return controller.register(registerInput).then((result) => {
        expect(service.registerTenant).toHaveBeenCalledWith(registerInput);
        expect(result).toEqual(mockRegisterResult);
      });
    });

    it('should return accessToken, user, and condominium', () => {
      return controller.register(registerInput).then((result) => {
        expect(result).toHaveProperty('message');
        expect(result).toHaveProperty('accessToken');
        expect(result).toHaveProperty('user');
        expect(result).toHaveProperty('condominium');
        expect(result.user.email).toBe(registerInput.adminEmail);
        expect(result.condominium.name).toBe(registerInput.condominiumName);
      });
    });
  });

  describe('login', () => {
    it('should call AuthService.login with correct data', () => {
      return controller.login(loginInput).then((result) => {
        expect(service.login).toHaveBeenCalledWith(loginInput);
        expect(result).toEqual(mockLoginResult);
      });
    });
    /* eslint-enable @typescript-eslint/unbound-method */

    it('should return accessToken, user, and condominium on login', () => {
      return controller.login(loginInput).then((result) => {
        expect(result).toHaveProperty('message');
        expect(result).toHaveProperty('accessToken');
        expect(result).toHaveProperty('user');
        expect(result).toHaveProperty('condominium');
        expect(result.user.email).toBe(loginInput.email);
      });
    });
  });
});
