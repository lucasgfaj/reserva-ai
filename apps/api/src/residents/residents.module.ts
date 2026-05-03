import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ResidentsController } from './residents.controller';
import { ResidentsService } from './residents.service';
import { CreateResidentValidator } from './validators/create-resident.validator';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'fallback_secret_key_for_development',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [ResidentsController],
  providers: [ResidentsService, CreateResidentValidator],
  exports: [ResidentsService],
})
export class ResidentsModule {}
