export class ExerciseResponseDto {
  id: string;
  unitId: string;
  name: string;
  description?: string;
  muscleGroups?: string[];
  equipment?: string[];
  defaultSets?: number;
  defaultReps?: string;
  defaultRestTime?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  targetGender?: 'male' | 'female' | 'other';
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
