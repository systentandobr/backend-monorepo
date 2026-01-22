import { IsString, IsNumber, IsOptional, IsDateString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckInHistoryQueryDto {
  @ApiProperty({
    description: 'Data inicial (ISO 8601)',
    example: '2023-10-01T00:00:00Z',
    required: false,
  })
  @IsDateString({}, { message: 'Data inicial inválida. Use formato ISO 8601' })
  @IsOptional()
  startDate?: string;

  @ApiProperty({
    description: 'Data final (ISO 8601)',
    example: '2023-10-31T23:59:59Z',
    required: false,
  })
  @IsDateString({}, { message: 'Data final inválida. Use formato ISO 8601' })
  @IsOptional()
  endDate?: string;

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
