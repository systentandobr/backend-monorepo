import { IsString, IsEnum, IsNumber, IsMongoId, IsOptional, IsObject, IsDate, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFranchiseTaskDto {
    @IsMongoId()
    franchiseId: string;

    @IsMongoId()
    userId: string;

    @IsMongoId()
    templateId: string;

    @IsString()
    name: string;

    @IsString()
    description: string;

    @IsString()
    category: string;

    @IsEnum(['pending', 'in-progress', 'completed', 'skipped'])
    @IsOptional()
    status?: 'pending' | 'in-progress' | 'completed' | 'skipped';

    @IsNumber()
    @Min(0)
    @Max(100)
    @IsOptional()
    progress?: number;

    @IsDate()
    @Type(() => Date)
    @IsOptional()
    dueDate?: Date;

    @IsObject()
    @IsOptional()
    metadata?: Record<string, any>;
}
