import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsObject,
  ValidateNested,
  IsNumber,
  IsBoolean,
  Min,
  Max,
  IsArray,
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

  @IsString()
  zipCode: string;

  @IsEnum(['physical', 'digital'])
  type: 'physical' | 'digital';
}

class TerritoryDto {
  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsBoolean()
  exclusive: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  radius?: number;
}

export class CreateFranchiseDto {
  @IsString()
  unitId: string;

  @IsString()
  name: string;

  @IsString()
  ownerId: string;

  @IsString()
  ownerName: string;

  @IsEmail()
  ownerEmail: string;

  @IsOptional()
  @IsString()
  ownerPhone?: string;

  @IsObject()
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @IsOptional()
  @IsEnum(['active', 'inactive', 'pending', 'suspended'])
  status?: 'active' | 'inactive' | 'pending' | 'suspended';

  @IsOptional()
  @IsEnum(['standard', 'premium', 'express'])
  type?: 'standard' | 'premium' | 'express';

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => TerritoryDto)
  territory?: TerritoryDto;

  @IsOptional()
  @IsArray()
  @IsEnum(['restaurant', 'delivery', 'retail', 'ecommerce', 'hybrid'], {
    each: true,
  })
  marketSegments?: (
    | 'restaurant'
    | 'delivery'
    | 'retail'
    | 'ecommerce'
    | 'hybrid'
  )[];
}
