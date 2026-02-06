import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateSupplierDto {
  @ApiProperty({ description: 'ID da unidade', example: '#BR#ALL#SYSTEM#0001' })
  @IsString()
  unitId: string;

  @ApiProperty({ description: 'Estado do fornecedor', example: 'ceara' })
  @IsString()
  estado: string;

  @ApiProperty({ description: 'Descrição/Nome do fornecedor', example: '#IFCE002 - UPA LELÊ' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ description: 'Website do fornecedor', example: 'https://example.com' })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional({ description: 'Instagram do fornecedor', example: 'https://instagram.com/useupalele' })
  @IsOptional()
  @IsString()
  instagram?: string;

  @ApiPropertyOptional({ description: 'Data de criação/registro', example: 'Adicionado em 9 de dezembro de 2022' })
  @IsOptional()
  @IsString()
  createdAt?: string;

  @ApiPropertyOptional({ description: 'Descrição da listagem com políticas de compra' })
  @IsOptional()
  @IsString()
  listingDescription?: string;

  @ApiPropertyOptional({ description: 'Localização física', example: 'Centro Fashion Fortaleza - Setor Azul' })
  @IsOptional()
  @IsString()
  localizacao?: string;

  @ApiPropertyOptional({ description: 'Requisito de CNPJ', example: 'Exige CNPJ? Não' })
  @IsOptional()
  @IsString()
  cnpj?: string;

  @ApiPropertyOptional({ description: 'Gêneros atendidos', example: 'Gênero: meninas, meninos' })
  @IsOptional()
  @IsString()
  genero?: string;

  @ApiPropertyOptional({ description: 'Tamanhos disponíveis', example: 'Tamanhos: 10, 12, 14, 16, 2, 4, 6, 8' })
  @IsOptional()
  @IsString()
  tamanho?: string;

  @ApiPropertyOptional({ description: 'Estilo/Categoria', example: 'Estilo: Moda praia' })
  @IsOptional()
  @IsString()
  estilo?: string;

  @ApiPropertyOptional({ description: 'Número da página', example: 12 })
  @IsOptional()
  @IsNumber()
  pageNum?: number;

  @ApiPropertyOptional({ description: 'Subpágina/link', example: 'listing/upalele/' })
  @IsOptional()
  @IsString()
  subpage?: string;
}
