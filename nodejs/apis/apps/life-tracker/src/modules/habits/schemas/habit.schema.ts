import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type HabitDocument = Habit & Document;

@Schema({ timestamps: true })
export class Habit {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  icon: string;

  @Prop()
  color?: string;

  @Prop({ required: true })
  categoryId: number;

  @Prop()
  description?: string;

  @Prop()
  target?: string;

  @Prop({ required: true, default: 0 })
  streak: number;

  @Prop({ required: true, default: false })
  completed: boolean;

  @Prop({ enum: ['morning', 'afternoon', 'evening', 'all'] })
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'all';

  @Prop({ required: true })
  createdAt: string;

  @Prop({ required: true })
  updatedAt: string;

  @Prop()
  domain?: string;
}

export const HabitSchema = SchemaFactory.createForClass(Habit); 