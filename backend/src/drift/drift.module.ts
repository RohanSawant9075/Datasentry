import { Module } from '@nestjs/common';
import { DriftService } from './drift.service';
import { DriftController } from './drift.controller';
import { MLClientModule } from '../ml-client/ml-client.module';

@Module({
  imports: [MLClientModule],
  controllers: [DriftController],
  providers: [DriftService],
  exports: [DriftService],
})
export class DriftModule {}
