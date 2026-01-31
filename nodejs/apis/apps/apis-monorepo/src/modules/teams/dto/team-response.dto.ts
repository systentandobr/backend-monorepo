import { StudentResponseDto } from '../../students/dto/student-response.dto';

export class TeamMetricsDto {
  totalStudents: number;
  totalCheckIns: number;
  completedTrainings: number;
  plannedTrainings: number;
  completionRate: number;
  averagePoints: number;
  currentStreak: number;
}

export class TeamResponseDto {
  id: string;
  unitId: string;
  name: string;
  description?: string;
  studentIds: string[];
  students?: StudentResponseDto[];
  metrics?: TeamMetricsDto;
  createdAt?: Date;
  updatedAt?: Date;
}
