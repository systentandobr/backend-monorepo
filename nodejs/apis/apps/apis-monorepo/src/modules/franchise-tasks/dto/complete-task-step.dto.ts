import { IsNumber, IsOptional, IsObject } from 'class-validator';

export class CompleteTaskStepDto {
  @IsNumber()
  stepOrder: number;

  @IsObject()
  @IsOptional()
  data?: any;
}
