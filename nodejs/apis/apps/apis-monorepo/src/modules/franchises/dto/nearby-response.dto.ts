import { ApiProperty } from '@nestjs/swagger';
import { FranchiseResponseDto } from './franchise-response.dto';

export class NearbyFranchiseDto extends FranchiseResponseDto {
  @ApiProperty({
    description: 'Distância em quilômetros do ponto de referência',
    example: 5.2,
  })
  distance: number; // em km
}
