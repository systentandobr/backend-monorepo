import { Controller, Get } from '@nestjs/common';
import { SysAssistenteEstudosService } from './sys-assistente-estudos.service';

@Controller()
export class SysAssistenteEstudosController {
  constructor(private readonly sysAssistenteEstudosService: SysAssistenteEstudosService) {}

  @Get()
  getHello(): string {
    return this.sysAssistenteEstudosService.getHello();
  }
}
