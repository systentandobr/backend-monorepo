import { Module } from '@nestjs/common';
import { SysProdutosController } from './sys-produtos.controller';
import { SysProdutosService } from './sys-produtos.service';

@Module({
  imports: [],
  controllers: [SysProdutosController],
  providers: [SysProdutosService],
})
export class SysProdutosModule {}
