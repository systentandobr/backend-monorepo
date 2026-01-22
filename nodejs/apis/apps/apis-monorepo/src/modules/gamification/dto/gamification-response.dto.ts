import { ApiProperty } from '@nestjs/swagger';

export class AchievementDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  id: string;

  @ApiProperty({ example: 'PRIMEIRA ÓRBITA' })
  name: string;

  @ApiProperty({ example: 'Complete seu primeiro treino' })
  description: string;

  @ApiProperty({ example: 'star' })
  icon: string;

  @ApiProperty({ enum: ['COMMON', 'RARE', 'EPIC', 'LEGENDARY'], example: 'COMMON' })
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

  @ApiProperty({ example: '2023-10-01T00:00:00Z', nullable: true })
  unlockedAt?: string;
}

export class RankingPositionDto {
  @ApiProperty({ example: 1 })
  position: number;

  @ApiProperty({ example: 4200 })
  totalPoints: number;

  @ApiProperty({ example: 15 })
  level: number;

  @ApiProperty({ example: 'FR-001' })
  unitId: string;

  @ApiProperty({ example: 'Unidade Centro' })
  unitName: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  userId: string;

  @ApiProperty({ example: 'Beatriz L.' })
  userName: string;
}

export class GamificationDataDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  userId: string;

  @ApiProperty({ example: 3100 })
  totalPoints: number;

  @ApiProperty({ example: 12 })
  level: number;

  @ApiProperty({ example: 850 })
  xp: number;

  @ApiProperty({ example: 1000 })
  xpToNextLevel: number;

  @ApiProperty({ type: [AchievementDto] })
  achievements: AchievementDto[];

  @ApiProperty({ type: [String], example: [] })
  completedTasks: string[];

  @ApiProperty({ type: RankingPositionDto, nullable: true })
  ranking?: RankingPositionDto;
}
