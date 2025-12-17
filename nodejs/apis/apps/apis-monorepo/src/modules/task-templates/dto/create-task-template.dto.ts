import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean, IsNumber, IsArray, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

class TaskStepDto {
    @IsNumber()
    order: number;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    description: string;

    @IsBoolean()
    @IsOptional()
    required?: boolean;
}

class ResourceDto {
    @IsString()
    type: string;

    @IsString()
    url: string;

    @IsString()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;
}

class ValidationDto {
    @IsString()
    @IsOptional()
    type?: string;

    @IsBoolean()
    @IsOptional()
    required?: boolean;

    @IsString()
    @IsOptional()
    instructions?: string;

    @IsArray()
    @IsOptional()
    acceptedFormats?: string[];
}

export class CreateTaskTemplateDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsString()
    @IsNotEmpty()
    category: string;

    @IsString()
    @IsOptional()
    type?: string;

    @IsString()
    @IsOptional()
    difficulty?: string;

    @IsNumber()
    @IsOptional()
    points?: number;

    @IsArray()
    @IsOptional()
    dependencies?: string[];

    @IsString()
    @IsOptional()
    instructions?: string;

    @IsString()
    @IsOptional()
    icon?: string;

    @IsString()
    @IsOptional()
    color?: string;

    @IsObject()
    @IsOptional()
    @ValidateNested()
    @Type(() => ValidationDto)
    validation?: ValidationDto;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => TaskStepDto)
    steps: TaskStepDto[];

    @IsOptional()
    formTemplate?: any;

    @IsString()
    @IsOptional()
    videoUrl?: string;

    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => ResourceDto)
    resources?: ResourceDto[];

    @IsNumber()
    @IsOptional()
    estimatedTime?: number;

    @IsBoolean()
    @IsOptional()
    isDefault?: boolean;

    @IsNumber()
    @IsOptional()
    order?: number;

    @IsObject()
    @IsOptional()
    metadata?: any;
}
