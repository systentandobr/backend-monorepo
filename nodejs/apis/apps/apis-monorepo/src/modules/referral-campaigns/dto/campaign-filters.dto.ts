import {
  IsOptional,
  IsEnum,
  IsString,
  IsMongoId,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CampaignFiltersDto {
  @IsOptional()
  @IsMongoId()
  franchiseId?: string;

  @IsOptional()
  @IsEnum(['draft', 'active', 'paused', 'expired', 'completed'])
  status?: 'draft' | 'active' | 'paused' | 'expired' | 'completed';

  @IsOptional()
  @IsEnum(['single-tier', 'multi-tier', 'hybrid'])
  type?: 'single-tier' | 'multi-tier' | 'hybrid';

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}
