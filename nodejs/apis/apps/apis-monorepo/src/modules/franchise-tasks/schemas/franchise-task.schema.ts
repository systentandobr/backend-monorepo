import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type FranchiseTaskDocument = FranchiseTask &
  Document & {
    createdAt?: Date;
    updatedAt?: Date;
  };

const CompletedStepSchema = new MongooseSchema(
  {
    stepOrder: { type: Number, required: true },
    completedAt: { type: Date, default: Date.now },
    data: { type: Object },
  },
  { _id: false },
);

@Schema({
  timestamps: true,
  collection: 'franchise_tasks',
})
export class FranchiseTask {
  _id?: Types.ObjectId;
  id?: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Franchise' })
  franchiseId: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'TaskTemplate' })
  templateId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  category: string; // Copied from template for easy querying

  @Prop({
    required: true,
    enum: ['pending', 'in-progress', 'completed', 'skipped'],
    default: 'pending',
  })
  status: 'pending' | 'in-progress' | 'completed' | 'skipped';

  @Prop({ required: true, default: 0 })
  progress: number; // 0-100

  @Prop({ type: [CompletedStepSchema], default: [] })
  completedSteps: {
    stepOrder: number;
    completedAt: Date;
    data?: any;
  }[];

  @Prop({ type: Object })
  formData?: Record<string, any>;

  @Prop({ default: Date.now })
  assignedAt: Date;

  @Prop()
  completedAt?: Date;

  @Prop()
  dueDate?: Date;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const FranchiseTaskSchema = SchemaFactory.createForClass(FranchiseTask);

FranchiseTaskSchema.index({ franchiseId: 1, status: 1 });
FranchiseTaskSchema.index({ userId: 1, status: 1 });
FranchiseTaskSchema.index({ templateId: 1 });
