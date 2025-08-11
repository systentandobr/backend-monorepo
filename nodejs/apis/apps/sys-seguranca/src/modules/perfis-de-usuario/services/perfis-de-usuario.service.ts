import { Injectable } from '@nestjs/common';
import { PerfisDeUsuarioDomain } from '../domains/perfis-de-usuario/perfis-de-usuario.domain';
import {
  PerfisDeUsuarioDto,
  PerfisDeUsuarioResponseDto,
} from '../data/dtos/PerfilsDeUsuarioDto';
import { IHttpResponse } from 'libs/infra/IHttpResponse';

@Injectable()
export class PerfisDeUsuarioService {
  constructor(readonly domain: PerfisDeUsuarioDomain) {}

  async listar(): Promise<PerfisDeUsuarioResponseDto[]> {
    return this.domain.listar();
  }

  async remover(param: PerfisDeUsuarioDto): Promise<IHttpResponse> {
    try {
      return await this.domain.remover(param);
    } catch (error) {
      return error as IHttpResponse;
    }
  }

  async cadastrar(a: PerfisDeUsuarioDto): Promise<IHttpResponse> {
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
