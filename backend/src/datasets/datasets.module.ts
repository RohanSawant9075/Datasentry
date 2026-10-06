import { Module } from '@nestjs/common';
import { DatasetsService } from './datasets.service';
import { DatasetsController } from './datasets.controller';
import { MLClientModule } from '../ml-client/ml-client.module';
import { PrismaModule } from '../common/prisma/prisma.module';

@Module({
  imports: [MLClientModule, PrismaModule],
  controllers: [DatasetsController],
  providers: [DatasetsService],
  exports: [DatasetsService],
})
export class DatasetsModule {}
