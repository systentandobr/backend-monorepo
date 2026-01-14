import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SysAssistenteEstudosService } from './sys-assistente-estudos.service';

@ApiTags('sys-assistente-estudos')
@Controller()
export class SysAssistenteEstudosController {
  constructor(
    private readonly sysAssistenteEstudosService: SysAssistenteEstudosService,
  ) {}

  @Get()
  getHello(): string {
    return this.sysAssistenteEstudosService.getHello();
  }
}
