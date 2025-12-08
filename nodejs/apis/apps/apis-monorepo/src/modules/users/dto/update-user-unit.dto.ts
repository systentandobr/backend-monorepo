import { IsString, IsOptional, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserUnitDto {
  @ApiProperty({
    description: 'ID da unidade/franquia a ser associada ao usuário. Use null ou string vazia para remover a associação.',
    example: 'FR-001',
    required: false,
  })
  @IsOptional()
  @ValidateIf((o) => o.unitId !== null && o.unitId !== undefined)
  @IsString({ message: 'unitId deve ser uma string' })
  unitId?: string | null;
}

