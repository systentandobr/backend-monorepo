import {
  IsString,
  IsEnum,
  IsArray,
  IsNumber,
  IsOptional,
  IsDateString,
  IsObject,
  ValidateNested,
  Min,
  IsBoolean,
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';

class RewardDto {
  @IsEnum(['cashback', 'discount', 'points', 'physical'])
  type: 'cashback' | 'discount' | 'points' | 'physical';

  @IsNumber()
  @Min(0)
  value: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsMongoId()
  productId?: string;
}

class CampaignRulesDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  minPurchaseValue?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxReferralsPerUser?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxReferralsTotal?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  expirationDays?: number;

  @IsOptional()
  @IsBoolean()
  requireEmailVerification?: boolean;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  allowedProducts?: string[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  excludedProducts?: string[];
}

export class CreateCampaignDto {
  @IsOptional()
  @IsMongoId()
  franchiseId?: string;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  slug: string;

  @IsEnum(['single-tier', 'multi-tier', 'hybrid'])
  type: 'single-tier' | 'multi-tier' | 'hybrid';

  @IsArray()
  @IsEnum(['cashback', 'discount', 'points', 'physical'], { each: true })
  rewardTypes: ('cashback' | 'discount' | 'points' | 'physical')[];

  @ValidateNested()
  @Type(() => RewardDto)
  referrerReward: RewardDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => RewardDto)
  refereeReward?: RewardDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CampaignRulesDto)
  rules?: CampaignRulesDto;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
