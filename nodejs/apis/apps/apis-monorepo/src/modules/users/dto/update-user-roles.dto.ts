import { IsArray, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserRolesDto {
  @ApiProperty({
    description: 'IDs ou nomes dos roles a serem associados ao usuário',
    example: ['role-id-1', 'role-id-2'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roles?: string[];

  @ApiProperty({
    description: 'IDs ou nomes das permissões a serem associadas ao usuário',
    example: ['permission-id-1', 'permission-id-2'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
}
