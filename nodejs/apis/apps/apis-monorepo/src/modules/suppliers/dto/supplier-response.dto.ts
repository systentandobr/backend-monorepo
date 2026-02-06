import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SupplierResponseDto {
  @ApiProperty({ description: 'ID do documento' })
  id: string;

  @ApiProperty({ description: 'ID da unidade' })
  unitId: string;

  @ApiProperty({ description: 'Estado do fornecedor' })
  estado: string;

  @ApiProperty({ description: 'Descrição/Nome do fornecedor' })
  description: string;

  @ApiPropertyOptional({ description: 'Website do fornecedor' })
  website?: string;

  @ApiPropertyOptional({ description: 'Instagram do fornecedor' })
  instagram?: string;

  @ApiPropertyOptional({ description: 'Data de criação/registro' })
  createdAt?: string;

  @ApiPropertyOptional({ description: 'Descrição da listagem com políticas de compra' })
  listingDescription?: string;

  @ApiPropertyOptional({ description: 'Localização física' })
  localizacao?: string;

  @ApiPropertyOptional({ description: 'Requisito de CNPJ' })
  cnpj?: string;

  @ApiPropertyOptional({ description: 'Gêneros atendidos' })
  genero?: string;

  @ApiPropertyOptional({ description: 'Tamanhos disponíveis' })
  tamanho?: string;

  @ApiPropertyOptional({ description: 'Estilo/Categoria' })
  estilo?: string;

  @ApiPropertyOptional({ description: 'Número da página' })
  pageNum?: number;

  @ApiPropertyOptional({ description: 'Subpágina/link' })
  subpage?: string;

  @ApiProperty({ description: 'Data de criação do registro' })
  createdAtDoc?: Date;

  @ApiProperty({ description: 'Data de atualização do registro' })
  updatedAtDoc?: Date;
}

export class SuppliersByUnitResponseDto {
  @ApiProperty({ description: 'ID da unidade' })
  unitId: string;

  @ApiProperty({ description: 'Total de fornecedores', example: 4 })
  total: number;

  @ApiProperty({ description: 'Lista de fornecedores', type: [SupplierResponseDto] })
  data: SupplierResponseDto[];
}
