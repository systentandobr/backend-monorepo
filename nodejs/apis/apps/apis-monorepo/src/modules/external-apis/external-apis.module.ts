import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ExternalApisController } from './external-apis.controller';
import { ExternalApisService } from './external-apis.service';

@Module({
  imports: [HttpModule],
  controllers: [ExternalApisController],
  providers: [ExternalApisService],
  exports: [ExternalApisService],
})
export class ExternalApisModule {}
