import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GamificationProfileDocument = GamificationProfile & Document;

@Schema({ timestamps: true })
export class GamificationProfile {
  @Prop({ required: true, unique: true })
  userId: string;

  @Prop({ required: true, default: 0 })
  totalPoints: number;

  @Prop({ required: true, default: 1 })
  level: number;

  @Prop({ required: true, default: 100 })
  pointsToNextLevel: number;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const GamificationProfileSchema = SchemaFactory.createForClass(GamificationProfile);
