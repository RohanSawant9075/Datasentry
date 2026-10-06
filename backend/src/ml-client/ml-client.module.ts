import { Module } from '@nestjs/common';
import { MLClientService } from './ml-client.service';

@Module({
  providers: [MLClientService],
  exports: [MLClientService],
})
export class MLClientModule {}
