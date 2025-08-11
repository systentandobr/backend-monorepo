import {
  Controller,
  Post,
  UseGuards,
  HttpCode,
  HttpStatus,
  Body,
  Delete,
  Res,
} from '@nestjs/common';
import { AutenticacaoService } from '../services/autenticacao.service';
import { AuthGuard } from '../autenticacao.guard';
import { IAutenticacaoDto } from '../data/interfaces/IAutenticacaoDto';
import { Response } from 'express';

@Controller('autenticacao')
export class AutenticacaoController {
  constructor(private service: AutenticacaoService) {}

  @Post('entrar')
  async entrar(@Body('apelido') apelido: string, @Body('senha') senha: string) {
    return this.service.entrar({ apelido, confirmSenha: senha });
  }

  @HttpCode(HttpStatus.ACCEPTED)
  @UseGuards(AuthGuard)
  @Post('validar')
  async validate(@Body() req: IAutenticacaoDto) {
    return this.service.validarUsuario(req.apelido, req.senha);
  }

  @Post('registrar')
  async cadastrar(
    @Body('apelido') apelido: string,
    @Body('senha') senha: string,
    @Res() response: Response,
  ) {
    const httpResponse = await this.service.cadastrar({
      apelido,
      confirmSenha: senha,
    });
    return response.status(httpResponse.statusCode).json(httpResponse);
  }

  @Delete('remover')
  async remover(@Body('apelido') apelido: string, @Res() response: Response) {
    const httpResponse = await this.service.remover({ apelido });
    return response.status(httpResponse.statusCode).json(httpResponse);
  }
}
