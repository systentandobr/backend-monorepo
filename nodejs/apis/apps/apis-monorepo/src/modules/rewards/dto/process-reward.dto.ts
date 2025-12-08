import { IsMongoId, IsOptional, IsObject } from 'class-validator';

export class ProcessRewardDto {
  @IsMongoId()
  referralId: string;

  @IsMongoId()
  userId: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
