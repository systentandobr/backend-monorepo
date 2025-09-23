import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PointTransactionDocument = PointTransaction & Document;

@Schema({ timestamps: true })
export class PointTransaction {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  points: number;

  @Prop({
    required: true,
    enum: ['HABIT_COMPLETION', 'ROUTINE_COMPLETION', 'ACHIEVEMENT', 'BONUS']    
  })
  sourceType: 'HABIT_COMPLETION' | 'ROUTINE_COMPLETION' | 'ACHIEVEMENT' | 'BONUS';

  @Prop({ required: true })
  sourceId: string;

  @Prop({ required: true })
  description: string;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const PointTransactionSchema = SchemaFactory.createForClass(PointTransaction);

// Índice para consultas por usuário
PointTransactionSchema.index({ userId: 1, createdAt: -1 });
