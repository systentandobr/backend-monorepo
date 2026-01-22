import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AchievementDocument = Achievement & Document & {
  createdAt?: Date;
  updatedAt?: Date;
};

@Schema({
  timestamps: true,
  collection: 'achievements',
})
export class Achievement {
  @Prop({ required: true, unique: true })
  achievementId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  icon: string;

  @Prop({
    type: String,
    enum: ['COMMON', 'RARE', 'EPIC', 'LEGENDARY'],
    default: 'COMMON',
  })
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const AchievementSchema = SchemaFactory.createForClass(Achievement);
