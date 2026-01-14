import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type TrainingPlanDocument = TrainingPlan & Document & {
  createdAt?: Date;
  updatedAt?: Date;
};

// Sub-schema para horários semanais
const TimeSlotSchema = new MongooseSchema({
  startTime: { type: String, required: true }, // HH:mm
  endTime: { type: String, required: true }, // HH:mm
  activity: { type: String, required: true },
}, { _id: false });

// Sub-schema para exercícios (definido antes de WeeklyScheduleSchema para evitar erro de inicialização)
const ExerciseSchema = new MongooseSchema({
  exerciseId: { type: String },
  name: { type: String, required: true },
  sets: { type: Number, required: true },
  reps: { type: String, required: true }, // pode ser "10-12" ou "até a falha"
  weight: { type: Number },
  restTime: { type: Number }, // em segundos
  notes: { type: String },
}, { _id: false });

const WeeklyScheduleSchema = new MongooseSchema({
  dayOfWeek: { type: Number, required: true, min: 0, max: 6 }, // 0-6 (domingo-sábado)
  timeSlots: { type: [TimeSlotSchema], default: [] },
  exercises: { type: [ExerciseSchema], default: [] }, // NOVO: exercícios associados ao dia
}, { _id: false });

// Sub-schema para progresso
const ProgressSchema = new MongooseSchema({
  completedObjectives: { type: [String], default: [] },
  lastUpdate: { type: Date, default: Date.now },
  notes: { type: String },
}, { _id: false });

@Schema({
  timestamps: true,
  collection: 'training_plans',
})
export class TrainingPlan {
  _id?: Types.ObjectId;
  id?: string;

  @Prop({ required: true, index: true })
  unitId: string;

  @Prop({ required: true, index: true, type: Types.ObjectId, ref: 'Student' })
  studentId: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ type: [String], default: [] })
  objectives: string[];

  @Prop({ type: [WeeklyScheduleSchema], default: [] })
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

  @Prop({ type: [ExerciseSchema], default: [] })
  exercises: {
    exerciseId?: string;
    name: string;
    sets: number;
    reps: string;
    weight?: number;
    restTime?: number;
    notes?: string;
  }[];

  @Prop({ type: Date, required: true })
  startDate: Date;

  @Prop({ type: Date })
  endDate?: Date;

  @Prop({
    type: String,
    enum: ['active', 'paused', 'completed'],
    default: 'active',
  })
  status: 'active' | 'paused' | 'completed';

  @Prop({ type: ProgressSchema })
  progress?: {
    completedObjectives: string[];
    lastUpdate: Date;
    notes?: string;
  };

  @Prop({ type: Boolean, default: false, index: true })
  isTemplate?: boolean;

  @Prop({
    type: String,
    enum: ['male', 'female', 'other'],
    index: true,
  })
  targetGender?: 'male' | 'female' | 'other';

  @Prop({ type: Types.ObjectId, ref: 'TrainingPlan' })
  templateId?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const TrainingPlanSchema = SchemaFactory.createForClass(TrainingPlan);

// Índices para performance
TrainingPlanSchema.index({ unitId: 1, studentId: 1 });
TrainingPlanSchema.index({ unitId: 1, status: 1 });
TrainingPlanSchema.index({ studentId: 1, status: 1 });
TrainingPlanSchema.index({ unitId: 1, createdAt: -1 });
TrainingPlanSchema.index({ unitId: 1, isTemplate: 1, targetGender: 1 });
