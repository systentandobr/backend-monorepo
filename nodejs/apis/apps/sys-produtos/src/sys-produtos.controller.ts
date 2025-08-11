import { Controller, Get } from '@nestjs/common';
import { SysProdutosService } from './sys-produtos.service';

@Controller('produtos')
export class SysProdutosController {
  constructor(private readonly sysProdutosService: SysProdutosService) {}

  @Get()
  getHello(): string {
    return this.sysProdutosService.getHello();
  }
}
