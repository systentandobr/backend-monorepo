import { IsOptional, IsEnum, IsString, IsMongoId, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ReferralFiltersDto {
  @IsOptional()
  @IsMongoId()
  campaignId?: string;

  @IsOptional()
  @IsMongoId()
  referrerId?: string;

  @IsOptional()
  @IsMongoId()
  refereeId?: string;

  @IsOptional()
  @IsEnum(['pending', 'registered', 'completed', 'cancelled', 'expired'])
  status?: 'pending' | 'registered' | 'completed' | 'cancelled' | 'expired';

  @IsOptional()
  @IsString()
  referralCode?: string;

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
