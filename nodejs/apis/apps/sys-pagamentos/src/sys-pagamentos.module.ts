import { Module } from '@nestjs/common';
import { SysPagamentosController } from './sys-pagamentos.controller';
import { SysPagamentosService } from './sys-pagamentos.service';

@Module({
  imports: [],
  controllers: [SysPagamentosController],
  providers: [SysPagamentosService],
})
export class SysPagamentosModule {}
