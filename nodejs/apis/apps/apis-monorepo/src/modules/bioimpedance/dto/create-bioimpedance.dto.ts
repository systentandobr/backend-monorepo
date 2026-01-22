import {
  IsString,
  IsNumber,
  IsDateString,
  IsBoolean,
  IsOptional,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBioimpedanceDto {
  @ApiProperty({
    description: 'ID do aluno',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  @IsOptional()
  studentId?: string;

  @ApiProperty({
    description: 'Data da avaliação (ISO 8601)',
    example: '2023-10-15T00:00:00Z',
  })
  @IsDateString({}, { message: 'Data inválida. Use formato ISO 8601' })
  date: string;

  @ApiProperty({
    description: 'Peso em kg',
    example: 78.5,
    minimum: 0,
  })
  @IsNumber({}, { message: 'Peso deve ser um número' })
  @Min(0, { message: 'Peso deve ser maior que zero' })
  weight: number;

  @ApiProperty({
    description: 'Percentual de gordura corporal (%)',
    example: 14.2,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber({}, { message: 'Percentual de gordura deve ser um número' })
  @Min(0, { message: 'Percentual de gordura deve ser entre 0 e 100' })
  @Max(100, { message: 'Percentual de gordura deve ser entre 0 e 100' })
  bodyFat: number;

  @ApiProperty({
    description: 'Massa muscular em kg',
    example: 42.1,
    minimum: 0,
  })
  @IsNumber({}, { message: 'Massa muscular deve ser um número' })
  @Min(0, { message: 'Massa muscular deve ser maior que zero' })
  muscle: number;

  @ApiProperty({
    description: 'Indica se é o melhor recorde (calculado automaticamente)',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isBestRecord?: boolean;
}
