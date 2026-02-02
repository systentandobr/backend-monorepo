import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PointTransactionDocument = PointTransaction & Document & {
  createdAt?: Date;
  updatedAt?: Date;
};

@Schema({
  timestamps: true,
  collection: 'point_transactions',
})
export class PointTransaction {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, index: true })
  unitId: string;

  @Prop({ required: true })
  points: number;

  @Prop({
    required: true,
    enum: [
      'HABIT_COMPLETION',
      'ROUTINE_COMPLETION',
      'ACHIEVEMENT',
      'BONUS',
      'CHECK_IN',
      'WORKOUT_COMPLETION',
      'EXERCISE_COMPLETION',
    ],
  })
  sourceType:
    | 'HABIT_COMPLETION'
    | 'ROUTINE_COMPLETION'
    | 'ACHIEVEMENT'
    | 'BONUS'
    | 'CHECK_IN'
    | 'WORKOUT_COMPLETION'
    | 'EXERCISE_COMPLETION';

  @Prop({ required: true })
  sourceId: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const PointTransactionSchema =
  SchemaFactory.createForClass(PointTransaction);

// Índices para performance
// Índice composto para consultas eficientes de check-ins por usuário/unidade/data
PointTransactionSchema.index({ userId: 1, unitId: 1, createdAt: -1 });
PointTransactionSchema.index({ userId: 1, createdAt: -1 });
PointTransactionSchema.index({ unitId: 1, createdAt: -1 });
// Índice para consultas de check-ins específicos (evitar duplicatas no mesmo dia)
PointTransactionSchema.index({ userId: 1, unitId: 1, sourceType: 1, createdAt: -1 });
