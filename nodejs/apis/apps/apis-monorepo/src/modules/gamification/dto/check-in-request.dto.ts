import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, ValidateNested, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class LocationDto {
  @ApiProperty({ example: -5.7945, description: 'Latitude' })
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat: number;

  @ApiProperty({ example: -35.2114, description: 'Longitude' })
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng: number;
}

export class CheckInRequestDto {
  @ApiProperty({
    type: LocationDto,
    required: false,
    description: 'Localização do check-in',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;
}
