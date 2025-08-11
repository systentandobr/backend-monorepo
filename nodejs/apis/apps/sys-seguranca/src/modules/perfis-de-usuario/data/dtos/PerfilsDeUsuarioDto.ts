import { MetadadosDto } from "libs/shared/data/dtos/Metadados";

export interface PerfisDeUsuarioDto {
  readonly id?: number;
  readonly nome: string;
  readonly cadastroDesativado?: boolean;
  readonly dataCadastro?: Date;
  readonly dataAtualizacao?: Date;
  readonly dataExclusao?: Date;
  readonly accessToken?: string;
}

export class PerfisDeUsuarioResponseDto extends MetadadosDto {
  id?: number;
  nome?: string;

  constructor() {
    super();
  }

  static toDto(objeto: PerfisDeUsuarioDto): PerfisDeUsuarioResponseDto {
    return {
      id: objeto.id,
      nome: objeto.nome,
      ...MetadadosDto.toDto(objeto),
    } as PerfisDeUsuarioResponseDto;
  }
}
