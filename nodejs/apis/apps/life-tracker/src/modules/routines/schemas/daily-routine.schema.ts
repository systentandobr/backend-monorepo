import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DailyRoutineDocument = DailyRoutine & Document;

@Schema({ timestamps: true })
export class DailyRoutine {
  @Prop({ required: true })
  time: string;

  @Prop({ required: true })
  activity: string;

  @Prop()
  domain?: string;

  @Prop({ required: true, default: false })
  completed: boolean;

  @Prop()
  completedAt?: Date;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const DailyRoutineSchema = SchemaFactory.createForClass(DailyRoutine);
