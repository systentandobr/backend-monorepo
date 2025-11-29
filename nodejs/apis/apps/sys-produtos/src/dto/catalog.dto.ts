import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCatalogDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ type: [String], default: [] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  productIds?: string[];

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}

export class UpdateCatalogDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  productIds?: string[];

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}

export class QueryCatalogDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}


