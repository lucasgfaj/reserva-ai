import { Module } from '@nestjs/common';
import { CommonAreasController } from './common-areas.controller';
import { CommonAreasService } from './common-areas.service';
import { CreateCommonAreaValidator } from './validators/create-common-area.validator';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CommonAreasController],
  providers: [CommonAreasService, CreateCommonAreaValidator],
  exports: [CommonAreasService],
})
export class CommonAreasModule {}
