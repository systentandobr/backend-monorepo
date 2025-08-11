export interface InformacoesAdicionaisUsuarioDto {
  readonly nome?: string;
  readonly cpf?: string;
  readonly email?: string;
  readonly celular?: string;
  readonly desativado: boolean;
  readonly dataCadastro?: Date;
  readonly dataAtualizacao?: Date;
  readonly dataExclusao?: Date;
}
