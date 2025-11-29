import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, Min, Max } from 'class-validator';
import { DiscountEvent, DiscountType } from '../schemas/product.schema';

export class CreateVariantDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  price: number; // Preço original/preço de venda

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  originalPrice?: number; // Preço original antes de qualquer desconto

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  promotionalPrice?: number; // Preço promocional (já com desconto aplicado)

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  costPrice?: number; // Preço de custo

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number; // Valor do desconto (percentual ou fixo)

  @ApiPropertyOptional({ enum: DiscountEvent })
  @IsOptional()
  @IsEnum(DiscountEvent)
  discountEvent?: DiscountEvent; // Tipo de evento de desconto

  @ApiPropertyOptional({ enum: DiscountType })
  @IsOptional()
  @IsEnum(DiscountType)
  discountType?: DiscountType; // Tipo de desconto (percentual ou fixo)

  @ApiPropertyOptional({ enum: ['BRL'], default: 'BRL' })
  @IsOptional()
  @IsEnum(['BRL'])
  currency?: 'BRL'; // Moeda (padrão BRL)

  @ApiPropertyOptional({ description: 'Comissão por transação (%)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  comissionPerTransaction?: number; // Comissão por transação (percentual)

  @ApiPropertyOptional({ description: 'Impostos (%) - pode ser calculado dinamicamente' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  taxes?: number; // Impostos (percentual)

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


