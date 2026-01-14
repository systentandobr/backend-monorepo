import { Expose } from 'class-transformer';

export class TrainingResponseDto {
  @Expose()
  id: string;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  category: string;

  @Expose()
  type: string;

  @Expose()
  videoUrl?: string;

  @Expose()
  thumbnailUrl?: string;

  @Expose()
  duration?: number;

  @Expose()
  resources: any[];

  @Expose()
  isGlobal: boolean;

  @Expose()
  franchiseId?: string;

  @Expose()
  order: number;

  @Expose()
  viewCount: number;

  @Expose()
  metadata: any;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
