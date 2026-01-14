import { PartialType } from '@nestjs/mapped-types';
import { CreateFranchiseTaskDto } from './create-franchise-task.dto';
import { IsOptional, IsObject } from 'class-validator';

export class UpdateFranchiseTaskDto extends PartialType(
  CreateFranchiseTaskDto,
) {
  @IsObject()
  @IsOptional()
  formData?: Record<string, any>;
}
