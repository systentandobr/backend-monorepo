import {
  IsString,
  IsEnum,
  IsNumber,
  IsMongoId,
  IsObject,
  IsOptional,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsUrl,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

class ResourceDto {
  @IsString()
  type: string;

  @IsString()
  url: string;

  @IsString()
  title: string;
}

export class CreateTrainingDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsEnum(['onboarding', 'marketing', 'sales', 'operations', 'other'])
  category: 'onboarding' | 'marketing' | 'sales' | 'operations' | 'other';

  @IsEnum(['video', 'pdf', 'article', 'interactive'])
  type: 'video' | 'pdf' | 'article' | 'interactive';

  @IsUrl()
  @IsOptional()
  videoUrl?: string;

  @IsUrl()
  @IsOptional()
  thumbnailUrl?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  duration?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResourceDto)
  @IsOptional()
  resources?: ResourceDto[];

  @IsBoolean()
  @IsOptional()
  isGlobal?: boolean;

  @IsMongoId()
  @IsOptional()
  franchiseId?: string;

  @IsNumber()
  @IsOptional()
  order?: number;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
