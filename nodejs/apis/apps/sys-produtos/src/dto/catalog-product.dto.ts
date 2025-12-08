import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateProdutoDto } from './create-produto.dto';

class ImageReferenceDto {
  @ApiProperty({ description: 'HashId da imagem já enviada' })
  @IsString()
  @IsNotEmpty()
  hashId: string;
}

export class CreateCatalogProductDto extends CreateProdutoDto {
  @ApiProperty({
    description: 'ID do fornecedor associado ao produto',
    example: 'supplier-123',
  })
  @IsString()
  @IsNotEmpty({ message: 'supplierId é obrigatório' })
  supplierId: string;

  @ApiPropertyOptional({
    description: 'Array de referências de imagens com hashId',
    type: [ImageReferenceDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImageReferenceDto)
  images?: ImageReferenceDto[];
}

