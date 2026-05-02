import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ReservationsModule } from './reservations/reservations.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/api/.env',
    }),
    PrismaModule,
    AuthModule,
    ReservationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
