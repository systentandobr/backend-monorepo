import {
    IsString,
    IsOptional,
    IsArray,
    IsEnum,
    ArrayMinSize,
} from 'class-validator';

export class GenerateExerciseVideoDto {
    @IsString()
    exerciseName: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsArray()
    @ArrayMinSize(1)
    @IsString({ each: true })
    muscleGroups: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    equipment?: string[];

    @IsOptional()
    @IsEnum(['male', 'female', 'other'])
    targetGender?: 'male' | 'female' | 'other';
}
