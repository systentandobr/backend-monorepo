import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserProgressDocument = UserProgress & Document;

@Schema({ timestamps: true })
export class UserProgress {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true, default: 0 })
  total_points: number;

  @Prop({ required: true, default: 0 })
  weekly_points: number;

  @Prop({ required: true, default: 0 })
  current_position: number;

  @Prop({ required: true, default: 1 })
  level: number;

  @Prop({ required: true, default: 0 })
  experience: number;

  @Prop({ type: [String], default: [] })
  achievements: string[];

  @Prop({ type: [String], default: [] })
  completed_milestones: string[];

  @Prop({ required: true, default: new Date() })
  last_activity: Date;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const UserProgressSchema = SchemaFactory.createForClass(UserProgress);
