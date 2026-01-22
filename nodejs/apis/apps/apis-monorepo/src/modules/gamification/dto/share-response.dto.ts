import { ApiProperty } from '@nestjs/swagger';

export class ShareStatsDto {
  @ApiProperty({ example: 45 })
  totalCheckIns: number;

  @ApiProperty({ example: 5 })
  currentStreak: number;

  @ApiProperty({ example: 12 })
  level: number;

  @ApiProperty({ example: 3100 })
  totalPoints: number;

  @ApiProperty({ example: 28 })
  completedWorkouts: number;

  @ApiProperty({ example: 156 })
  completedExercises: number;
}

export class ShareResponseDto {
  @ApiProperty({
    example: 'https://api.example.com/shared/progress/user123.png',
  })
  imageUrl: string;

  @ApiProperty({
    example: 'Estou no nível 12 com 3100 pontos! 🚀',
  })
  text: string;

  @ApiProperty({ type: ShareStatsDto })
  stats: ShareStatsDto;
}
