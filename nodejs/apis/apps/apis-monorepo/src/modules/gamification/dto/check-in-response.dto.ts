import { ApiProperty } from '@nestjs/swagger';

export class CheckInDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  id: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439012' })
  studentId: string;

  @ApiProperty({ example: '2023-10-15T08:30:00Z' })
  date: string;

  @ApiProperty({ example: 10 })
  points: number;

  @ApiProperty({ example: 'FR-001' })
  unitId: string;

  @ApiProperty({ type: Object, nullable: true, required: false })
  metadata?: {
    location?: {
      lat: number;
      lng: number;
    };
    device?: string;
    [key: string]: any;
  };
}

export class CheckInHistoryResponseDto {
  @ApiProperty({ type: [CheckInDto] })
  checkIns: CheckInDto[];

  @ApiProperty({ example: 45 })
  total: number;

  @ApiProperty({ example: 5 })
  currentStreak: number;

  @ApiProperty({ example: 12 })
  longestStreak: number;
}
