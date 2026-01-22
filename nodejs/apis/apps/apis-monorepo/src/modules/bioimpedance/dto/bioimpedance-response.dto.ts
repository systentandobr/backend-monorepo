import { ApiProperty } from '@nestjs/swagger';

export class BioimpedanceResponseDto {
  @ApiProperty({
    description: 'ID da avaliação',
    example: '507f1f77bcf86cd799439011',
  })
  id: string;

  @ApiProperty({
    description: 'ID do aluno',
    example: '507f1f77bcf86cd799439012',
  })
  studentId: string;

  @ApiProperty({
    description: 'Data da avaliação (ISO 8601)',
    example: '2023-10-15T00:00:00Z',
  })
  date: string;

  @ApiProperty({
    description: 'Peso em kg',
    example: 78.5,
  })
  weight: number;

  @ApiProperty({
    description: 'Percentual de gordura corporal (%)',
    example: 14.2,
  })
  bodyFat: number;

  @ApiProperty({
    description: 'Massa muscular em kg',
    example: 42.1,
  })
  muscle: number;

  @ApiProperty({
    description: 'Indica se é o melhor recorde',
    example: true,
  })
  isBestRecord: boolean;
}
