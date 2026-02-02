import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type TrainingExecutionDocument = TrainingExecution &
  Document & {
    createdAt?: Date;
    updatedAt?: Date;
  };

// Sub-schema para ExecutedSet
const ExecutedSetSchema = new MongooseSchema(
  {
    setNumber: { type: Number, required: true },
    plannedReps: { type: String, required: true },
    executedReps: { type: Number },
    plannedWeight: { type: Number },
    executedWeight: { type: Number },
    completed: { type: Boolean, default: false },
    timestamp: { type: String },
  },
  { _id: false },
);

// Sub-schema para ExerciseExecution
const ExerciseExecutionSchema = new MongooseSchema(
  {
    exerciseId: { type: String },
    name: { type: String, required: true },
    executedSets: { type: [ExecutedSetSchema], default: [] },
  },
  { _id: false },
);

@Schema({
  timestamps: true,
  collection: 'training_executions',
})
export class TrainingExecution {
  _id?: Types.ObjectId;
  id?: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'TrainingPlan', index: true })
  trainingPlanId: Types.ObjectId | string;

  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, index: true })
  unitId: string;

  @Prop({ required: true, type: Date })
  startedAt: Date;

  @Prop({ type: Date })
  completedAt?: Date;

  @Prop({
    required: true,
    enum: ['in_progress', 'completed', 'abandoned'],
    default: 'in_progress',
  })
  status: 'in_progress' | 'completed' | 'abandoned';

  @Prop({ type: [ExerciseExecutionSchema], default: [] })
  exercises: {
    exerciseId?: string;
    name: string;
    executedSets: {
      setNumber: number;
      plannedReps: string;
      executedReps?: number;
      plannedWeight?: number;
      executedWeight?: number;
      completed?: boolean;
      timestamp?: string;
    }[];
  }[];

  @Prop({ type: Number })
  totalDurationSeconds?: number;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const TrainingExecutionSchema =
  SchemaFactory.createForClass(TrainingExecution);

// Índices para performance
TrainingExecutionSchema.index({ userId: 1, unitId: 1, status: 1 });
TrainingExecutionSchema.index({ userId: 1, startedAt: -1 });
TrainingExecutionSchema.index({ trainingPlanId: 1, startedAt: -1 });
TrainingExecutionSchema.index({ userId: 1, unitId: 1, startedAt: -1 });
