import { Controller, Get } from '@nestjs/common';
import { SysPagamentosService } from './sys-pagamentos.service';

@Controller()
export class SysPagamentosController {
  constructor(private readonly sysPagamentosService: SysPagamentosService) {}

  @Get()
  getHello(): string {
    return this.sysPagamentosService.getHello();
  }
}
