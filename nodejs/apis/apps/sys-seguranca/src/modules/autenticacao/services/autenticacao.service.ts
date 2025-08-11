import { Injectable } from '@nestjs/common';
import { AutenticacaoResponseDto } from '../data/interfaces/IAutenticacaoDto';
import { AutenticacaoDomain } from '../domains/autenticacao.domain';
import { IHttpResponse } from 'libs/infra/IHttpResponse';

@Injectable()
export class AutenticacaoService {
  constructor(readonly domain: AutenticacaoDomain) { }

  async encontrarPorApelido(apelido: string): Promise<any> {
    return this.domain.encontrarPorApelido(apelido);
  }

  async listar(): Promise<AutenticacaoResponseDto[]> {
    return this.domain.listar();
  }

  async remover(param: { apelido: string }): Promise<IHttpResponse> {
    try {
      return await this.domain.remover(param);
    } catch (error) {
      return error as IHttpResponse;
    }
  }

  async validarUsuario(apelido: string, senha: string): Promise<any> {
    return this.domain.validarTokenAcesso(apelido, senha);
  }

  async entrar(param: { apelido: string; confirmSenha: string }): Promise<any> {
    return this.domain.entrar(param);
  }

  async cadastrar(a: {
    apelido: string;
    confirmSenha: string;
  }): Promise<IHttpResponse> {
    let response: IHttpResponse = {} as IHttpResponse;
    try {
      response.data = await this.domain.cadastrar(a);
      return response;
    } catch (error) {
      response = error as IHttpResponse;
    }
    return response;
  }
}
