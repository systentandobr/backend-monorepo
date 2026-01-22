import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsIn,
  Min,
  Max,
  ValidateIf,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class NearbyQueryDto {
  @ApiProperty({
    description: 'Latitude do ponto de referência',
    example: -5.7793,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(-90, { message: 'Latitude deve estar entre -90 e 90' })
  @Max(90, { message: 'Latitude deve estar entre -90 e 90' })
  @ValidateIf((o) => !o.address)
  lat?: number;

  @ApiProperty({
    description: 'Longitude do ponto de referência',
    example: -35.2009,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(-180, { message: 'Longitude deve estar entre -180 e 180' })
  @Max(180, { message: 'Longitude deve estar entre -180 e 180' })
  @ValidateIf((o) => !o.address)
  lng?: number;

  @ApiProperty({
    description: 'Endereço para geocodificação (alternativa a lat/lng)',
    example: 'Rua das Flores, 123, Natal, RN',
    required: false,
  })
  @IsString()
  @IsOptional()
  @ValidateIf((o) => !o.lat || !o.lng)
  address?: string;

  @ApiProperty({
    description: 'Tipo de segmentação de mercado para filtrar',
    example: 'gym',
    enum: [
      'restaurant',
      'delivery',
      'retail',
      'ecommerce',
      'hybrid',
      'gym',
      'solar_plant',
    ],
    required: true,
  })
  @IsString()
  @IsIn([
    'restaurant',
    'delivery',
    'retail',
    'ecommerce',
    'hybrid',
    'gym',
    'solar_plant',
  ])
  marketSegment: string;

  @ApiProperty({
    description: 'Raio máximo de busca em quilômetros',
    example: 10,
    default: 50,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(1, { message: 'Raio deve ser no mínimo 1 km' })
  @Max(1000, { message: 'Raio deve ser no máximo 1000 km' })
  radius?: number; // em km

  @ApiProperty({
    description: 'Número máximo de resultados',
    example: 20,
    default: 20,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(1, { message: 'Limit deve ser no mínimo 1' })
  @Max(100, { message: 'Limit deve ser no máximo 100' })
  limit?: number;
}
