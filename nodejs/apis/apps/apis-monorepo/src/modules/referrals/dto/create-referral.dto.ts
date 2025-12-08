import {
  IsString,
  IsMongoId,
  IsOptional,
  IsEnum,
  IsObject,
} from 'class-validator';

export class CreateReferralDto {
  @IsMongoId()
  campaignId: string;

  @IsOptional()
  @IsEnum(['whatsapp', 'email', 'link', 'social'])
  sharedVia?: 'whatsapp' | 'email' | 'link' | 'social';

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
