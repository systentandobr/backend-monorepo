import { ApiProperty } from '@nestjs/swagger';

export class ActivityDto {
  @ApiProperty({ enum: ['CHECK_IN', 'WORKOUT_COMPLETION', 'EXERCISE_COMPLETION'] })
  type: 'CHECK_IN' | 'WORKOUT_COMPLETION' | 'EXERCISE_COMPLETION';

  @ApiProperty({ example: '08:30' })
  time: string;

  @ApiProperty({ example: 10 })
  points: number;

  @ApiProperty({ example: 'Check-in realizado' })
  description: string;
}

export class DailyActivityDto {
  @ApiProperty({ example: '2023-10-15' })
  date: string;

  @ApiProperty({ example: 'DOM' })
  dayOfWeek: string;

  @ApiProperty({ example: 1 })
  checkIns: number;

  @ApiProperty({ example: 1 })
  workoutsCompleted: number;

  @ApiProperty({ example: 8 })
  exercisesCompleted: number;

  @ApiProperty({ example: 85 })
  totalPoints: number;

  @ApiProperty({ type: [ActivityDto] })
  activities: ActivityDto[];
}

export class WeeklyActivitySummaryDto {
  @ApiProperty({ example: 7 })
  totalCheckIns: number;

  @ApiProperty({ example: 4 })
  totalWorkouts: number;

  @ApiProperty({ example: 32 })
  totalExercises: number;

  @ApiProperty({ example: 420 })
  totalPoints: number;

  @ApiProperty({ example: 60 })
  averagePointsPerDay: number;
}

export class WeeklyActivityResponseDto {
  @ApiProperty({
    type: 'object',
    properties: {
      startDate: { type: 'string', example: '2023-10-09T00:00:00Z' },
      endDate: { type: 'string', example: '2023-10-15T23:59:59Z' },
    },
  })
  period: {
    startDate: string;
    endDate: string;
  };

  @ApiProperty({ type: [DailyActivityDto] })
  dailyActivity: DailyActivityDto[];

  @ApiProperty({ type: WeeklyActivitySummaryDto })
  summary: WeeklyActivitySummaryDto;
}
