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
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  lng: number;

  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsString()
  state: string;
}

class ProjectPhaseHistoryDto {
  @IsEnum(['planning', 'licensing', 'procurement', 'installation', 'operation'])
  phase: string;

  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(['pending', 'in_progress', 'completed'])
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateSolarProjectDto {
  @IsString()
  unitId: string;

  @IsString()
  name: string;

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

  @IsObject()
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
