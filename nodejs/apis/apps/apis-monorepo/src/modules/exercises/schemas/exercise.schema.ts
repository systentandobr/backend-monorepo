import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ExerciseDocument = Exercise &
  Document & {
    createdAt?: Date;
    updatedAt?: Date;
  };

@Schema({
  timestamps: true,
  collection: 'exercises',
})
export class Exercise {
  _id?: Types.ObjectId;
  id?: string;

  @Prop({ required: true, index: true })
  unitId: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ type: [String] })
  muscleGroups?: string[]; // Ex: ['peito', 'tríceps']

  @Prop({ type: [String] })
  equipment?: string[]; // Ex: ['barra', 'halteres', 'máquina']

  @Prop({ type: Number })
  defaultSets?: number;

  @Prop({ type: String })
  defaultReps?: string; // Ex: "10-12"

  @Prop({ type: Number })
  defaultRestTime?: number; // em segundos

  @Prop({ type: String, enum: ['beginner', 'intermediate', 'advanced'] })
  difficulty?: 'beginner' | 'intermediate' | 'advanced';

  @Prop({ type: String, enum: ['male', 'female', 'other'] })
  targetGender?: 'male' | 'female' | 'other';

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: [String] })
  images?: string[]; // URLs das imagens do exercício

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const ExerciseSchema = SchemaFactory.createForClass(Exercise);

// Índices para performance
ExerciseSchema.index({ unitId: 1, isActive: 1 });
ExerciseSchema.index({ unitId: 1, name: 1 });
ExerciseSchema.index({ unitId: 1, muscleGroups: 1 });
ExerciseSchema.index({ unitId: 1, targetGender: 1 });
ExerciseSchema.index({ unitId: 1, difficulty: 1 });
