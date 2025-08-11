export interface IAutenticacaoDto {
  readonly id?: number;
  readonly apelido: string;
  readonly senha: string;
  readonly acessoPermitido: boolean;
  readonly cadastroDesativado?: boolean;
  readonly dataCadastro?: Date;
  readonly dataAtualizacao?: Date;
  readonly dataExclusao?: Date;
}

export class AutenticacaoResponseDto {
  id?: number;
  apelido?: string;
  acessoPermitido?: boolean;
  cadastroDesativado?: boolean;
  dataCadastro?: Date;
  dataAtualizacao?: Date;
  dataExclusao?: Date;

  static convertToResponseDto(
    autenticacao: IAutenticacaoDto,
  ): AutenticacaoResponseDto {
    return !autenticacao.cadastroDesativado
      ? ({
        id: autenticacao.id,
        apelido: autenticacao.apelido,
        acessoPermitido: autenticacao.acessoPermitido,
        dataCadastro: autenticacao.dataCadastro,
        dataAtualizacao: autenticacao.dataAtualizacao,
        dataExclusao: autenticacao.dataExclusao,
      } as AutenticacaoResponseDto)
      : {
        id: autenticacao.id,
        cadastroDesativado: autenticacao.cadastroDesativado,
        dataExclusao: autenticacao.dataExclusao,
      };
  }
}
