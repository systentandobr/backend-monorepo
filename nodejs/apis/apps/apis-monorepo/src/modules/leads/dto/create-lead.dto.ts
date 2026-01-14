import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsObject,
  IsArray,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { LeadSource } from '../schemas/lead.schema';

export class CreateLeadDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsEnum(LeadSource)
  source?: LeadSource;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  score?: number;
}
