import {
  HttpException,
  Injectable,
  NotAcceptableException,
} from '@nestjs/common';
import { PerfisDeUsuarioRepository } from '../../repositories/repositories.repository';
import {
  PerfisDeUsuarioDto,
  PerfisDeUsuarioResponseDto,
} from '../../data/dtos/PerfilsDeUsuarioDto';
import { Messages } from '../../handlers/Messages';
import { capturarRespostas } from '../../handlers/handlersResponse';
import { IPerfisDeUsuario } from '../../data/interfaces/IPerfilsDeUsuario';
import { IHttpResponse } from 'libs/infra/IHttpResponse';

@Injectable()
export class PerfisDeUsuarioDomain {
  constructor(readonly repository: PerfisDeUsuarioRepository) {}

  async encontrarPorNomeDoPerfil(apelido: string): Promise<any> {
    try {
      const response = await this.repository.validaJaExisteCadastro(apelido);
      if (!response)
        throw new NotAcceptableException(Messages.PERFIL_NAO_ENCONTRADO);
      return response;
    } catch (error) {
      throw capturarRespostas(error as NotAcceptableException);
    }
  }

  private async validaJaExisteCadastro(apelido: string): Promise<boolean> {
    const usu = await this.repository.validaJaExisteCadastro(apelido);
    return !usu;
  }

  async listar(): Promise<PerfisDeUsuarioResponseDto[]> {
    try {
      const response: any = [];
      await new Promise(async (res) => {
        res(
          (await this.repository.listar()).map(async (obj) => {
            response.push(PerfisDeUsuarioResponseDto.toDto(obj));
            return obj;
          }),
        );
      });
      return response;
    } catch (error) {
      throw error as Error;
    }
  }

  async remover(param: PerfisDeUsuarioDto): Promise<IHttpResponse> {
    try {
      const obj = await this.encontrarPorNomeDoPerfil(param.nome);
      await this.repository.remover(obj);
      return capturarRespostas(
        new HttpException(Messages.PERFIL_REMOVIDO_SUCESSO, 200),
      );
    } catch (error) {
      return error as IHttpResponse;
    }
  }

  async cadastrar(a: PerfisDeUsuarioDto): Promise<any> {
    try {
      const jaRegistrado = await this.validaJaExisteCadastro(a.nome);
      if (!jaRegistrado) {
        throw new NotAcceptableException(Messages.PERFIL_JA_CADASTRADO);
      }
      const obj: PerfisDeUsuarioDto = {
        nome: a.nome,
        dataCadastro: new Date(),
      };
      const criado = PerfisDeUsuarioResponseDto.toDto(
        await this.repository.cadastrar(obj as IPerfisDeUsuario),
      );
      return {
        mensagem: Messages.PERFIL_CRIADO_COM_SUCESSO,
        autenticacao: criado,
      };
    } catch (error) {
      throw capturarRespostas(error as Error);
    }
  }
}
