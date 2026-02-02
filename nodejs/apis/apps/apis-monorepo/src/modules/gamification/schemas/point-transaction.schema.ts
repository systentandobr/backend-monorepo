import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PointTransactionDocument = PointTransaction & Document & {
  createdAt?: Date;
  updatedAt?: Date;
};

// Constante compartilhada para os valores do enum sourceType
export const SOURCE_TYPE_ENUM = [
  'HABIT_COMPLETION',
  'ROUTINE_COMPLETION',
  'ACHIEVEMENT',
  'BONUS',
  'CHECK_IN',
  'WORKOUT_COMPLETION',
  'EXERCISE_COMPLETION',
] as const;

export type SourceType = (typeof SOURCE_TYPE_ENUM)[number];

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
    enum: SOURCE_TYPE_ENUM,
    type: String,
  })
  sourceType: SourceType;

  @Prop({ required: true })
  sourceId: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const PointTransactionSchema =
  SchemaFactory.createForClass(PointTransaction);

// Garantir que o enum está aplicado corretamente no schema do Mongoose
// Isso é necessário porque o Mongoose pode não aplicar corretamente o enum do decorator em alguns casos
// Usamos type assertion porque o tipo do schema path não expõe o método enum diretamente
(PointTransactionSchema.path('sourceType') as any).enum(SOURCE_TYPE_ENUM);

// Índices para performance
// Índice composto para consultas eficientes de check-ins por usuário/unidade/data
PointTransactionSchema.index({ userId: 1, unitId: 1, createdAt: -1 });
PointTransactionSchema.index({ userId: 1, createdAt: -1 });
PointTransactionSchema.index({ unitId: 1, createdAt: -1 });
// Índice para consultas de check-ins específicos (evitar duplicatas no mesmo dia)
PointTransactionSchema.index({ userId: 1, unitId: 1, sourceType: 1, createdAt: -1 });
