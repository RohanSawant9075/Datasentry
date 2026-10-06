import { Module } from '@nestjs/common';
import { ReliabilityService } from './reliability.service';
import { ReliabilityController } from './reliability.controller';
import { MLClientModule } from '../ml-client/ml-client.module';

@Module({
  imports: [MLClientModule],
  controllers: [ReliabilityController],
  providers: [ReliabilityService],
  exports: [ReliabilityService],
})
export class ReliabilityModule {}
