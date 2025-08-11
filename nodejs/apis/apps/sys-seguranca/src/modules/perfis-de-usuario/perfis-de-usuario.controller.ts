import { Body, Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../autenticacao/autenticacao.guard';
import { PerfisDeUsuarioService } from './services/perfis-de-usuario.service';
import { PerfisDeUsuarioDto } from './data/dtos/PerfilsDeUsuarioDto';

@Controller('perfis-de-usuario')
export class PerfisDeUsuarioController {
  constructor(private service: PerfisDeUsuarioService) {}

  @UseGuards(AuthGuard)
  @Get('perfis-de-usuario')
  getProfile(@Body() req: PerfisDeUsuarioDto) {
    return req.nome;
  }

  @UseGuards(AuthGuard)
  @Get('listar')
  async listar() {
    return this.service.listar();
  }
}
