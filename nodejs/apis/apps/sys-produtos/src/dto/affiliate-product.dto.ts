import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, Min, Max } from 'class-validator';

export type AffiliatePlatform = 
  | 'shopee' 
  | 'amazon' 
  | 'magalu' 
  | 'mercadolivre' 
  | 'americanas' 
  | 'casasbahia' 
  | 'other';

export type ProcessingStatus = 
  | 'pending' 
  | 'processing' 
  | 'completed' 
  | 'failed' 
  | 'retrying';

export class CreateAffiliateProductDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty()
  @IsUrl()
  @IsNotEmpty()
  affiliateUrl: string;

  @ApiProperty({ enum: ['shopee', 'amazon', 'magalu', 'mercadolivre', 'americanas', 'casasbahia', 'other'] })
  @IsEnum(['shopee', 'amazon', 'magalu', 'mercadolivre', 'americanas', 'casasbahia', 'other'])
  @IsOptional()
  platform?: AffiliatePlatform;
}

export class UpdateAffiliateProductDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiProperty({ required: false })
  @IsUrl()
  @IsOptional()
  affiliateUrl?: string;

  @ApiProperty({ enum: ['pending', 'processing', 'completed', 'failed', 'retrying'], required: false })
  @IsEnum(['pending', 'processing', 'completed', 'failed', 'retrying'])
  @IsOptional()
  processingStatus?: ProcessingStatus;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  errorMessage?: string;
}

export class QueryAffiliateProductDto {
  @ApiProperty({ required: false })
  @IsEnum(['pending', 'processing', 'completed', 'failed', 'retrying'])
  @IsOptional()
  status?: ProcessingStatus;

  @ApiProperty({ required: false })
  @IsEnum(['shopee', 'amazon', 'magalu', 'mercadolivre', 'americanas', 'casasbahia', 'other'])
  @IsOptional()
  platform?: AffiliatePlatform;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiProperty({ required: false, default: 1 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiProperty({ required: false, default: 20 })
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number;
}

