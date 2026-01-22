import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GamificationProfileDocument = GamificationProfile & Document & {
  createdAt?: Date;
  updatedAt?: Date;
};

@Schema({
  timestamps: true,
  collection: 'gamification_profiles',
})
export class GamificationProfile {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, index: true })
  unitId: string;

  @Prop({ required: true, default: 0 })
  totalPoints: number;

  @Prop({ required: true, default: 1 })
  level: number;

  @Prop({ required: true, default: 0 })
  xp: number; // Experiência atual do nível atual

  @Prop({ required: true, default: 100 })
  xpToNextLevel: number; // Experiência necessária para o próximo nível

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const GamificationProfileSchema =
  SchemaFactory.createForClass(GamificationProfile);

// Índices para performance
GamificationProfileSchema.index({ userId: 1, unitId: 1 }, { unique: true });
GamificationProfileSchema.index({ unitId: 1, totalPoints: -1, level: -1 });
