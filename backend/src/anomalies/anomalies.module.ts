import { Module } from '@nestjs/common';
import { AnomaliesService } from './anomalies.service';
import { AnomaliesController } from './anomalies.controller';
import { MLClientModule } from '../ml-client/ml-client.module';

@Module({
  imports: [MLClientModule],
  controllers: [AnomaliesController],
  providers: [AnomaliesService],
  exports: [AnomaliesService],
})
export class AnomaliesModule {}
