export interface Endereco {
  readonly cep?: string;
  readonly rua?: string;
  readonly numero?: string;
  readonly complemento?: string;
  readonly bairro?: string;
  readonly cidade?: string;
  readonly estado?: string;

  readonly dataCadastro?: Date;
  readonly dataAtualizacao?: Date;
  readonly dataExclusao?: Date;
  readonly ativo?: boolean;
  readonly token?: string;
}
