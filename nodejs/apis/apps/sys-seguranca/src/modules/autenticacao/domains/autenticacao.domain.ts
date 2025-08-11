import {
  Injectable,
  NotAcceptableException,
  HttpException,
} from '@nestjs/common';
import { AutenticacaoRepository } from '../autenticacao.repository';
import { capturarRespostasAutenticacao } from '../exceptions/handlersResponse';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {
  AutenticacaoResponseDto,
  IAutenticacaoDto,
} from '../data/interfaces/IAutenticacaoDto';
import { Constants } from '@lib/utils/contantes/Contants';
import { IHttpResponse } from 'libs/infra/IHttpResponse';

@Injectable()
export class AutenticacaoDomain {
  constructor(
    readonly repository: AutenticacaoRepository,
    private jwtService: JwtService,
  ) {}

  private async gerarTokenAcesso(auth: any) {
    const payload = { username: auth.apelido, sub: auth._id };
    return this.jwtService.sign(payload);
  }

  private async validaExistenciaUsuario(apelido: string): Promise<boolean> {
    const usu = await this.repository.encontrarApelido(apelido);
    return !usu;
  }

  async encontrarPorApelido(apelido: string): Promise<any> {
    try {
      const response = await this.repository.encontrarApelido(apelido);
      if (!response)
        throw new NotAcceptableException(Constants.USUARIO_NAO_ENCONTRADO);
      return response;
    } catch (error) {
      throw capturarRespostasAutenticacao(error as NotAcceptableException);
    }
  }

  async listar(): Promise<AutenticacaoResponseDto[]> {
    try {
      const response: any = [];
      await new Promise(async (res) => {
        res(
          (await this.repository.listar()).map(async (usu) => {
            response.push(AutenticacaoResponseDto.convertToResponseDto(usu));
            return usu;
          }),
        );
      });
      return response;
    } catch (error) {
      throw error as Error;
    }
  }

  async remover(param: { apelido: string }): Promise<IHttpResponse> {
    try {
      const auth = await this.encontrarPorApelido(param.apelido);
      await this.repository.remover(auth);
      return capturarRespostasAutenticacao(
        new HttpException(Constants.USUARIO_REMOVIDO_SUCESSO, 200),
      );
    } catch (error) {
      return error as IHttpResponse;
    }
  }

  async validarTokenAcesso(apelido: string, senha: string): Promise<any> {
    const usu = await this.encontrarPorApelido(apelido);
    if (!usu) return null;
    const passwordValid = await bcrypt.compare(senha, usu.senha);
    if (!usu) {
      capturarRespostasAutenticacao(
        new NotAcceptableException(Constants.USUARIO_INVALIDO),
      );
    }
    if (usu && passwordValid) {
      return usu;
    }
    return null;
  }

  async entrar(param: { apelido: string; confirmSenha: string }): Promise<any> {
    let response: IHttpResponse;
    try {
      const usu = await this.encontrarPorApelido(param.apelido);
      const senhaValida = await bcrypt.compare(param.confirmSenha, usu.senha);
      if (usu && senhaValida) {
        return {
          accessToken: await this.gerarTokenAcesso(usu),
        };
      }
      return null;
    } catch (error) {
      response = capturarRespostasAutenticacao(error as Error);
    }
    return response;
  }

  async cadastrar(a: { apelido: string; confirmSenha: string }): Promise<any> {
    try {
      const jaRegistrado = await this.validaExistenciaUsuario(a.apelido);
      if (!jaRegistrado) {
        throw new NotAcceptableException(Constants.USUARIO_JA_CADASTRADO);
      }
      const saltOrRounds = 10;
      const senhaSalgada = await bcrypt.hash(a.confirmSenha, saltOrRounds);
      const auth: IAutenticacaoDto = {
        apelido: a.apelido,
        senha: senhaSalgada,
        acessoPermitido: true,
        dataCadastro: new Date(),
      };
      const criado = AutenticacaoResponseDto.convertToResponseDto(
        await this.repository.cadastrar(auth),
      );
      return {
        mensagem: Constants.USUARIO_CRIADO_COM_SUCESSO,
        autenticacao: criado,
      };
    } catch (error) {
      throw capturarRespostasAutenticacao(error as Error);
    }
  }
}
