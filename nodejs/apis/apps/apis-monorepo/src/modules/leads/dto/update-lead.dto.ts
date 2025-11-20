import { PartialType } from '@nestjs/mapped-types';
import { CreateLeadDto } from './create-lead.dto';
import { IsOptional, IsEnum, IsString, IsObject } from 'class-validator';
import { LeadStatus } from '../schemas/lead.schema';

export class UpdateLeadDto extends PartialType(CreateLeadDto) {
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsObject()
  pipeline?: {
    stage: string;
  };
}

