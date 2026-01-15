import {
  IsString,
  IsOptional,
  IsEnum,
  IsObject,
  ValidateNested,
  IsNumber,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

class LocationDto {
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat?: number;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng?: number;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;
}

export class UpdateSolarProjectDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalCapacityKW?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  terrainArea?: number;

  @IsOptional()
  @IsDateString()
  installationDate?: string;

  @IsOptional()
  @IsEnum(['planning', 'licensing', 'procurement', 'installation', 'operation'])
  projectPhase?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalInvestment?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  currentCostPerKWH?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  utilityCostPerKWH?: number;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
