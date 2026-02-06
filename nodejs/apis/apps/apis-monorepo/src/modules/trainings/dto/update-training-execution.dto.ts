import { IsArray, IsNumber, IsOptional, IsString, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class ExecutedSetDto {
  @IsNumber()
  setNumber: number;

  @IsString()
  plannedReps: string;

  @IsOptional()
  @IsNumber()
  executedReps?: number;

  @IsOptional()
  @IsNumber()
  plannedWeight?: number;

  @IsOptional()
  @IsNumber()
  executedWeight?: number;

  @IsOptional()
  completed?: boolean;

  @IsOptional()
  @IsString()
  timestamp?: string;

  @IsOptional()
  @IsNumber()
  durationSeconds?: number;

  @IsOptional()
  @IsNumber()
  restDurationSeconds?: number;
}

export class UpdateExerciseExecutionDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExecutedSetDto)
  executedSets: ExecutedSetDto[];
}

export class CompleteTrainingExecutionDto {
  @IsOptional()
  @IsNumber()
  totalDurationSeconds?: number;
}
