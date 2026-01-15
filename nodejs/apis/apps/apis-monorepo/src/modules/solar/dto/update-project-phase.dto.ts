import {
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateProjectPhaseDto {
  @IsEnum(['planning', 'licensing', 'procurement', 'installation', 'operation'])
  projectPhase: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
