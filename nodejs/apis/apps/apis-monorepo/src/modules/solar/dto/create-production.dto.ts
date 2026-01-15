import {
  IsNumber,
  IsOptional,
  IsObject,
  ValidateNested,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

class WeatherConditionsDto {
  @IsOptional()
  @IsNumber()
  temperature?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  irradiance?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  cloudCover?: number;
}

export class CreateProductionDto {
  @IsOptional()
  @IsDateString()
  timestamp?: string;

  @IsNumber()
  @Min(0)
  productionKW: number;

  @IsNumber()
  @Min(0)
  productionKWH: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  efficiency: number;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => WeatherConditionsDto)
  weatherConditions?: WeatherConditionsDto;
}
