import { Expose, Type } from 'class-transformer';

export class TaskTemplateResponseDto {
    @Expose()
    id: string;

    @Expose()
    name: string;

    @Expose()
    description: string;

    @Expose()
    category: string;

    @Expose()
    type: string;

    @Expose()
    steps: any[];

    @Expose()
    formTemplate?: any;

    @Expose()
    videoUrl?: string;

    @Expose()
    resources: any[];

    @Expose()
    estimatedTime: number;

    @Expose()
    isDefault: boolean;

    @Expose()
    order: number;

    @Expose()
    metadata: any;

    @Expose()
    createdAt: Date;

    @Expose()
    updatedAt: Date;
}
