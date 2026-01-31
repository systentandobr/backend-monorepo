import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GoogleMapsScriptUrlDto {
  @ApiProperty({
    description: 'URL do script do Google Maps com API key protegida',
    example: 'https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&loading=async',
  })
  scriptUrl: string;
}

export class GeocodeRequestDto {
  @ApiProperty({
    description: 'Endereço para geocodificar',
    example: 'Rua Exemplo, 123, São Paulo, SP',
  })
  @IsString()
  address: string;
}

export class GeocodeResponseDto {
  @ApiProperty({ description: 'Latitude' })
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat: number;

  @ApiProperty({ description: 'Longitude' })
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng: number;

  @ApiProperty({ description: 'Endereço formatado' })
  @IsString()
  formattedAddress: string;

  @ApiPropertyOptional({ description: 'Cidade' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'Estado' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ description: 'CEP' })
  @IsOptional()
  @IsString()
  zipCode?: string;
}

export class PlacesAutocompleteRequestDto {
  @ApiProperty({
    description: 'Texto de busca para autocomplete',
    example: 'Rua Exemplo',
  })
  @IsString()
  input: string;

  @ApiPropertyOptional({
    description: 'País para restringir resultados (código ISO 3166-1 Alpha-2)',
    example: 'br',
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({
    description: 'Latitude para bias de localização',
  })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat?: number;

  @ApiPropertyOptional({
    description: 'Longitude para bias de localização',
  })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng?: number;
}

export class PlacePredictionDto {
  @ApiProperty({ description: 'ID do lugar' })
  placeId: string;

  @ApiProperty({ description: 'Descrição do lugar' })
  description: string;

  @ApiPropertyOptional({ description: 'Termos de correspondência' })
  matchedSubstrings?: Array<{
    length: number;
    offset: number;
  }>;
}

export class PlacesAutocompleteResponseDto {
  @ApiProperty({
    description: 'Lista de previsões de lugares',
    type: [PlacePredictionDto],
  })
  predictions: PlacePredictionDto[];
}
