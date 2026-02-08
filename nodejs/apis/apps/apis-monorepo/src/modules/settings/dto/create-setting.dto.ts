import {
  IsString,
  IsOptional,
  IsObject,
  IsBoolean,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class TelegramConfigDto {
  @IsOptional()
  @IsString()
  botToken?: string;

  @IsOptional()
  @IsString()
  chatId?: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}

class DiscordConfigDto {
  @IsOptional()
  @IsString()
  webhookUrl?: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}

class EmailConfigDto {
  @IsOptional()
  @IsString()
  host?: string;

  @IsOptional()
  @IsNumber()
  port?: number;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}

class NotificationsConfigDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => TelegramConfigDto)
  telegram?: TelegramConfigDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => DiscordConfigDto)
  discord?: DiscordConfigDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => EmailConfigDto)
  email?: EmailConfigDto;
}

class LocationDto {
  @IsOptional()
  @IsNumber()
  lat?: number;

  @IsOptional()
  @IsNumber()
  lng?: number;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  zipCode?: string;

  @IsOptional()
  @IsString()
  type?: 'physical' | 'digital';
}

class TerritoryDto {
  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsBoolean()
  exclusive?: boolean;

  @IsOptional()
  @IsNumber()
  radius?: number;
}

class FranchiseConfigDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  ownerName?: string;

  @IsOptional()
  @IsString()
  ownerEmail?: string;

  @IsOptional()
  @IsString()
  ownerPhone?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;

  @IsOptional()
  @IsString()
  status?: 'active' | 'inactive' | 'pending' | 'suspended';

  @IsOptional()
  @IsString()
  type?: 'standard' | 'premium' | 'express';

  @IsOptional()
  @ValidateNested()
  @Type(() => TerritoryDto)
  territory?: TerritoryDto;
}

export class CreateSettingDto {
  @IsString()
  unitId: string;

  @IsOptional()
  @IsString()
  franchiseId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => NotificationsConfigDto)
  notifications?: NotificationsConfigDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => FranchiseConfigDto)
  franchise?: FranchiseConfigDto;

  @IsOptional()
  @IsObject()
  general?: Record<string, any>;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SegmentConfigDto)
  segments?: SegmentConfigDto[];
}

class SegmentConfigDto {
  @IsString()
  segment: string;

  @IsOptional()
  @IsString()
  notificationUrl?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => NotificationsConfigDto)
  notifications?: NotificationsConfigDto;
}
