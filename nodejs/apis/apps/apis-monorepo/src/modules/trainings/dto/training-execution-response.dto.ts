export class ExecutedSetResponseDto {
  setNumber: number;
  plannedReps: string;
  executedReps?: number;
  plannedWeight?: number;
  executedWeight?: number;
  completed?: boolean;
  timestamp?: string;
}

export class ExerciseExecutionResponseDto {
  exerciseId?: string;
  name: string;
  executedSets: ExecutedSetResponseDto[];
}

export class TrainingExecutionResponseDto {
  id: string;
  trainingPlanId: string;
  userId: string;
  unitId: string;
  startedAt: Date;
  completedAt?: Date;
  status: 'in_progress' | 'completed' | 'abandoned';
  exercises: ExerciseExecutionResponseDto[];
  totalDurationSeconds?: number;
  metadata?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}
