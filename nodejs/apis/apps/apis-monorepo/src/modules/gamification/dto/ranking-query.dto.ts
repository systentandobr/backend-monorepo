import { IsString, IsNumber, IsNotEmpty, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RankingQueryDto {
  @ApiProperty({
    description: 'ID da unidade',
    example: 'FR-001',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'unitId é obrigatório' })
  unitId: string;

  @ApiProperty({
    description: 'Número máximo de resultados',
    example: 50,
    required: false,
    default: 50,
    minimum: 1,
  })
  @IsNumber()
  @IsOptional()
  @Min(1, { message: 'Limit deve ser maior que zero' })
  limit?: number;
}
