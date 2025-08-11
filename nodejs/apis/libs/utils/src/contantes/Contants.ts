import { env } from "process";

export class Constants {
  static readonly ERRO_DESCONHECIDO = 'Erro desconhecido';

  static readonly USUARIO_INVALIDO = 'Usuário inválido';
  static readonly USUARIO_NAO_ENCONTRADO = 'Usuário não encontrado';
  static readonly USUARIO_JA_CADASTRADO: string = 'Usuário já cadastrado';
  static readonly USUARIO_REMOVIDO_SUCESSO: string =
    'Usuário removido com sucesso';
  static readonly USUARIO_CRIADO_COM_SUCESSO: string =
    'Usuário criado com sucesso';
}

export const jwtConstants = {
  secret:
    env.JWT_SECRET || 'secret_id',
};
