export class TrainingPlanResponseDto {
  id: string;
  unitId: string;
  studentId: string;
  name: string;
  description?: string;
  objectives: string[];
  weeklySchedule: {
    dayOfWeek: number;
    timeSlots: {
      startTime: string;
      endTime: string;
      activity: string;
    }[];
    exercises?: {
      exerciseId?: string;
      name: string;
      sets: number;
      reps: string;
      weight?: number;
      restTime?: number;
      notes?: string;
    }[];
  }[];
  exercises?: {
    exerciseId?: string;
    name: string;
    sets: number;
    reps: string;
    weight?: number;
    restTime?: number;
    notes?: string;
  }[]; // Opcional para compatibilidade retroativa
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'paused' | 'completed';
  progress?: {
    completedObjectives: string[];
    lastUpdate: Date;
    notes?: string;
  };
  isTemplate?: boolean;
  targetGender?: 'male' | 'female' | 'other';
  templateId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
