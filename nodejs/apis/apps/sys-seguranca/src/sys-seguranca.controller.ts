import { Controller, Get } from '@nestjs/common';
import { SysSegurancaService } from './sys-seguranca.service';

@Controller()
export class SysSegurancaController {
  constructor(private readonly sysSegurancaService: SysSegurancaService) {}

  @Get()
  getHello(): string {
    return this.sysSegurancaService.getHello();
  }
}
