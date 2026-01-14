import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserAchievementDocument = UserAchievement & Document;

@Schema({ timestamps: true })
export class UserAchievement {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  achievementId: string;

  @Prop({ required: true })
  unlockedAt: Date;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const UserAchievementSchema =
  SchemaFactory.createForClass(UserAchievement);

// Índice composto para garantir que um usuário só possa ganhar cada conquista uma vez
UserAchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });
