import { PartialType } from '@nestjs/mapped-types';
import { CreateCampaignDto } from './create-campaign.dto';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateCampaignDto extends PartialType(CreateCampaignDto) {
  @IsOptional()
  @IsEnum(['draft', 'active', 'paused', 'expired', 'completed'])
  status?: 'draft' | 'active' | 'paused' | 'expired' | 'completed';
}
