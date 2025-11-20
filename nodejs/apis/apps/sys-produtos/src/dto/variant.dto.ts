import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, Min } from 'class-validator';

export class CreateVariantDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  promotionalPrice?: number;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  attributes?: Record<string, any>;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean = true;
}

export class UpdateVariantDto extends PartialType(CreateVariantDto) {}

export class AdjustStockDto {
  @ApiProperty({ description: 'Identificador da unidade (unitId)' })
  @IsString()
  @IsNotEmpty()
  unitId: string;

  @ApiPropertyOptional({ description: 'Quantidade absoluta para setar (opcional)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

  @ApiPropertyOptional({ description: 'Reservado absoluto para setar (opcional)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  reserved?: number;
}

export class AdjustStockDeltaDto {
  @ApiProperty({ description: 'Identificador da unidade (unitId)' })
  @IsString()
  @IsNotEmpty()
  unitId: string;

  @ApiPropertyOptional({ description: 'Delta para quantity (pode ser negativo)' })
  @IsOptional()
  @IsNumber()
  quantityDelta?: number;

  @ApiPropertyOptional({ description: 'Delta para reserved (pode ser negativo)' })
  @IsOptional()
  @IsNumber()
  reservedDelta?: number;
}


