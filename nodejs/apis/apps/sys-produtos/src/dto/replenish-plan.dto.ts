import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReplenishPlanRequestDto {
  @ApiProperty({
    description: 'ID da unidade para gerar o plano de reposição',
    example: 'unit_123',
  })
  @IsString()
  @IsNotEmpty()
  unitId: string;
}

export class ReplenishSuggestionDto {
  @ApiProperty({
    description: 'ID do produto',
    example: 'prod_123',
  })
  productId: string;

  @ApiProperty({
    description: 'SKU da variante',
    example: 'SKU-001',
  })
  sku: string;

  @ApiProperty({
    description: 'Quantidade sugerida para reposição',
    example: 10,
  })
  suggestedQty: number;

  @ApiProperty({
    description: 'Motivo da sugestão',
    enum: ['below_safety', 'projected_demand', 'stockout_risk'],
    example: 'below_safety',
  })
  reason: 'below_safety' | 'projected_demand' | 'stockout_risk';
}

export class ReplenishPlanResponseDto {
  @ApiProperty({
    description: 'ID da unidade',
    example: 'unit_123',
  })
  unitId: string;

  @ApiProperty({
    description: 'Lista de sugestões de reposição',
    type: [ReplenishSuggestionDto],
  })
  suggestions: ReplenishSuggestionDto[];

  @ApiProperty({
    description: 'Data/hora de geração do plano',
    example: '2024-01-15T10:30:00Z',
  })
  generatedAt: string;
}
