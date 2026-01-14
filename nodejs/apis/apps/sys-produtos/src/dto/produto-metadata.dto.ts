import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateProdutoMetadataDto {
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  images?: string[];

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  // attributesTemplate é um objeto livre (validado no front), manteremos como any aqui
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attributesTemplate?: Record<string, any>;
}

export class ImageDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  url?: string;
}

export class CategoryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;
}
