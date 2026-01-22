import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserAchievementDocument = UserAchievement & Document & {
  createdAt?: Date;
  updatedAt?: Date;
};

@Schema({
  timestamps: true,
  collection: 'user_achievements',
})
export class UserAchievement {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, index: true })
  achievementId: string;

  @Prop({ type: Date })
  unlockedAt?: Date;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const UserAchievementSchema =
  SchemaFactory.createForClass(UserAchievement);

// Índices para performance
UserAchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });
UserAchievementSchema.index({ userId: 1, unlockedAt: -1 });
