import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min, Max, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductType, DishComposition } from '../schemas/product.schema';

export class ProductDimensionsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number; // em kg

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  height?: number; // em cm

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  width?: number; // em cm

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  length?: number; // em cm
}

export class TaxInformationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cest?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  exempt?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isTaxed?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  fullTaxes?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  originState?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certifications?: string[];

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  icmsByState?: {
    [state: string]: {
      origin: 'Internal' | 'External';
      taxRate: number;
    };
  };

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => Object)
  icmsSt?: {
    baseCalculation: number;
    taxRate: number;
    mva: number;
  };
}

export class CreateProdutoDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  costPrice?: number; // Preço de custo

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  active?: boolean = true;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  tags?: string[];

  // Campos adicionais migrados
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  brand?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  productModel?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({ type: ProductDimensionsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProductDimensionsDto)
  dimensions?: ProductDimensionsDto;

  @ApiPropertyOptional({ minimum: 0, maximum: 5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  reviewCount?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  materials?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  careInstructions?: string[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  warranty?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  ncm?: string; // NCM - CRÍTICO

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  ean13?: string; // Código de barras EAN-13 - CRÍTICO

  @ApiPropertyOptional({ enum: ['UN', 'KG', 'M', 'L'] })
  @IsOptional()
  @IsEnum(['UN', 'KG', 'M', 'L'])
  unitOfMeasurement?: 'UN' | 'KG' | 'M' | 'L';

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  supplierID?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  recommendedAge?: string;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  specifications?: Record<string, any>;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  url?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  affiliateUrl?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  thumbnail?: string;

  @ApiPropertyOptional({ type: TaxInformationDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => TaxInformationDto)
  taxInformation?: TaxInformationDto;

  @ApiPropertyOptional({ enum: ['product', 'dish'], default: 'product' })
  @IsOptional()
  @IsEnum(['product', 'dish'])
  type?: ProductType;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => Object)
  dishComposition?: DishComposition;
}


