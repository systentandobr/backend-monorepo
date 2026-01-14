import {
  IsString,
  IsOptional,
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  ValidateNested,
  Min,
  Max,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TimeSlotDto {
  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsString()
  activity: string;
}

export class WeeklyScheduleDto {
  @IsNumber()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlotDto)
  timeSlots: TimeSlotDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExerciseDto)
  exercises?: ExerciseDto[]; // NOVO - opcional para compatibilidade
}

export class ExerciseDto {
  @IsOptional()
  @IsString()
  exerciseId?: string;

  @IsString()
  name: string;

  @IsNumber()
  sets: number;

  @IsString()
  reps: string;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsNumber()
  restTime?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateTrainingPlanDto {
  @IsString()
  studentId: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  objectives: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WeeklyScheduleDto)
  weeklySchedule?: WeeklyScheduleDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExerciseDto)
  exercises?: ExerciseDto[]; // Opcional para compatibilidade retroativa

  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(['active', 'paused', 'completed'])
  status?: 'active' | 'paused' | 'completed';

  @IsOptional()
  @IsBoolean()
  isTemplate?: boolean;

  @IsOptional()
  @IsEnum(['male', 'female', 'other'])
  targetGender?: 'male' | 'female' | 'other';

  @IsOptional()
  @IsString()
  templateId?: string;
}
