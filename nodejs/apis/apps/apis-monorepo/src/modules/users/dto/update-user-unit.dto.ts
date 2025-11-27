import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserUnitDto {
  @ApiProperty({
    description: 'ID da unidade/franquia a ser associada ao usuário',
    example: 'FR-001',
  })
  @IsString()
  @IsNotEmpty({ message: 'unitId é obrigatório' })
  unitId: string;
}

