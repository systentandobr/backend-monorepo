import { Endereco } from './Endereco';

export interface Pessoa {
  readonly nome?: string;
  readonly email?: string;
  readonly telefone?: string;
  readonly endereco?: Endereco[];
  readonly cpf?: string;
  readonly cnpj?: string;
  readonly dataNascimento?: Date;
  readonly dataCadastro?: Date;
  readonly dataAtualizacao?: Date;
  readonly dataExclusao?: Date;
  readonly ativo?: boolean;
}
