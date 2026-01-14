class MetadadosResponseDto {
  cadastroDesativado?: boolean;
  dataCadastro?: Date;
  dataAtualizacao?: Date;
  dataExclusao?: Date;
}

export class MetadadosDto {
  cadastroDesativado?: boolean;
  dataCadastro?: Date;
  dataAtualizacao?: Date;
  dataExclusao?: Date;

  static toDto(objeto: MetadadosDto): MetadadosResponseDto {
    return {
      cadastroDesativado: objeto.cadastroDesativado,
      dataCadastro: objeto.dataCadastro,
      dataAtualizacao: objeto.dataAtualizacao,
      dataExclusao: objeto.dataExclusao,
    } as MetadadosResponseDto;
  }
}
