import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SysPagamentosService } from './sys-pagamentos.service';

@ApiTags('sys-pagamentos')
@Controller()
export class SysPagamentosController {
  constructor(private readonly sysPagamentosService: SysPagamentosService) {}

  @Get()
  getHello(): string {
    return this.sysPagamentosService.getHello();
  }
}
