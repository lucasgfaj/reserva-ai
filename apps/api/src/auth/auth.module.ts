import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { ResidentsController } from './residents.controller';
import { AuthService } from './auth.service';
import { RegisterTenantValidator } from './validators/register-tenant.validator';
import { LoginValidator } from './validators/login.validator';
import { CreateResidentValidator } from './validators/create-resident.validator';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'fallback_secret_key_for_development',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController, ResidentsController],
  providers: [
    AuthService,
    RegisterTenantValidator,
    LoginValidator,
    CreateResidentValidator,
  ],
  exports: [AuthService],
})
export class AuthModule {}
