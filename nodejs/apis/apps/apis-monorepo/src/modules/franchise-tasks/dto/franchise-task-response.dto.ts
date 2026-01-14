import { Expose } from 'class-transformer';

export class FranchiseTaskResponseDto {
  @Expose()
  id: string;

  @Expose()
  franchiseId: string;

  @Expose()
  userId: string;

  @Expose()
  templateId: string;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  category: string;

  @Expose()
  status: string;

  @Expose()
  progress: number;

  @Expose()
  completedSteps: any[];

  @Expose()
  formData?: any;

  @Expose()
  assignedAt: Date;

  @Expose()
  completedAt?: Date;

  @Expose()
  dueDate?: Date;

  @Expose()
  metadata: any;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
