import { IsString, IsOptional, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ProgressQueryDto {
  @ApiProperty({
    description: 'Período de análise',
    example: '6 meses',
    enum: ['6 meses', '1 ano', 'todo período'],
    required: false,
    default: '6 meses',
  })
  @IsString()
  @IsOptional()
  @IsIn(['6 meses', '1 ano', 'todo período'], {
    message: 'Período deve ser: "6 meses", "1 ano" ou "todo período"',
  })
  period?: '6 meses' | '1 ano' | 'todo período';
}
