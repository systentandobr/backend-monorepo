import {
  IsString,
  IsEmail,
  IsOptional,
  IsDateString,
  IsEnum,
  IsObject,
  IsArray,
  IsBoolean,
} from 'class-validator';

export class AddressDto {
  @IsOptional()
  @IsString()
  street?: string;

  @IsOptional()
  @IsString()
  number?: string;

  @IsOptional()
  @IsString()
  complement?: string;

  @IsOptional()
  @IsString()
  neighborhood?: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsOptional()
  @IsString()
  zipCode?: string;
}

export class EmergencyContactDto {
  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsString()
  relationship: string;
}

export class HealthInfoDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  medicalConditions?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  medications?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  injuries?: string[];

  @IsOptional()
  @IsEnum(['beginner', 'intermediate', 'advanced'])
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
}

export class CreateStudentDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  cpf?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsEnum(['male', 'female', 'other'])
  gender?: 'male' | 'female' | 'other';

  @IsOptional()
  @IsObject()
  address?: AddressDto;

  @IsOptional()
  @IsObject()
  emergencyContact?: EmergencyContactDto;

  @IsOptional()
  @IsObject()
  healthInfo?: HealthInfoDto;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
