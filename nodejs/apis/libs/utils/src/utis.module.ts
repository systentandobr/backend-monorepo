import { Module } from '@nestjs/common';
import { UtisService } from './utis.service';

@Module({
  providers: [UtisService],
  exports: [UtisService],
})
export class UtisModule {}
