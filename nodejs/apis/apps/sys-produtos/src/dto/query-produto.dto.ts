import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBooleanString, IsInt, IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryProdutoDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tag?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBooleanString()
  featured?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  priceMin?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  priceMax?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBooleanString()
  inStock?: string;

  @ApiPropertyOptional({ enum: ['price_asc', 'price_desc', 'rating_desc', 'newest', 'popular'] })
  @IsOptional()
  @IsString()
  sortBy?: 'price_asc' | 'price_desc' | 'rating_desc' | 'newest' | 'popular';

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 20;
}


