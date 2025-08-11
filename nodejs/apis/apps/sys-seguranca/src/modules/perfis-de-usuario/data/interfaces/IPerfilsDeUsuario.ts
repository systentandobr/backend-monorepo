export interface IPerfisDeUsuario {
  readonly id?: number;
  readonly nome: string;
  readonly cadastroDesativado: boolean;
  readonly dataCadastro?: Date;
  readonly dataAtualizacao?: Date;
  readonly dataExclusao?: Date;
  readonly accessToken?: string;
}
