import { IsString, IsMongoId, IsOptional } from 'class-validator';

export class CreateTrainingExecutionDto {
  @IsMongoId()
  trainingPlanId: string;

  @IsString()
  userId: string;

  @IsString()
  unitId: string;

  @IsOptional()
  @IsString()
  metadata?: Record<string, any>;
}
