import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AchievementDocument = Achievement & Document;

@Schema({ timestamps: true })
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
    type: {
      criteriaType: {
        type: String,
        enum: ['STREAK', 'POINTS', 'HABIT_COUNT', 'ROUTINE_COUNT'],
        required: true,
      },
      value: { type: Number, required: true },
    },
    required: true,
  })
  criteria: {
    criteriaType: 'STREAK' | 'POINTS' | 'HABIT_COUNT' | 'ROUTINE_COUNT';
    value: number;
  };

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const AchievementSchema = SchemaFactory.createForClass(Achievement);
