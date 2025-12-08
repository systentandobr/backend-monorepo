import { IsString, IsEnum, IsNumber, IsBoolean, IsOptional, IsArray, ValidateNested, IsObject, Min } from 'class-validator';
import { Type } from 'class-transformer';

class TaskStepDto {
    @IsNumber()
    order: number;

    @IsString()
    title: number;

    @IsString()
    description: string;

    @IsBoolean()
    required: boolean;
}

class ResourceDto {
    @IsEnum(['video', 'pdf', 'link'])
    type: 'video' | 'pdf' | 'link';

    @IsString()
    url: string;

    @IsString()
    title: string;
}

export class CreateTaskTemplateDto {
    @IsString()
    name: string;

    @IsString()
    description: string;

    @IsEnum(['automation', 'whatsapp', 'social-media', 'training', 'onboarding', 'other'])
    category: 'automation' | 'whatsapp' | 'social-media' | 'training' | 'onboarding' | 'other';

    @IsEnum(['single', 'multi-step', 'form', 'video'])
    type: 'single' | 'multi-step' | 'form' | 'video';

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => TaskStepDto)
    @IsOptional()
    steps?: TaskStepDto[];

    @IsObject()
    @IsOptional()
    formTemplate?: Record<string, any>;

    @IsString()
    @IsOptional()
    videoUrl?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ResourceDto)
    @IsOptional()
    resources?: ResourceDto[];

    @IsNumber()
    @Min(0)
    estimatedTime: number;

    @IsBoolean()
    @IsOptional()
    isDefault?: boolean;

    @IsNumber()
    @IsOptional()
    order?: number;

    @IsObject()
    @IsOptional()
    metadata?: Record<string, any>;
}
