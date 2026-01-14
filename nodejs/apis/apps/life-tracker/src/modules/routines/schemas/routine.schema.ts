import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RoutineDocument = Routine & Document;

@Schema({ timestamps: true })
export class Routine {
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

  @Prop({ default: 0 })
  streak: number;

  @Prop({ default: false })
  completed: boolean;

  @Prop({ enum: ['morning', 'afternoon', 'evening', 'all'] })
  timeOfDay?: string;

  @Prop()
  domain?: string;

  @Prop({ required: true })
  createdAt: string;

  @Prop({ required: true })
  updatedAt: string;
}

export const RoutineSchema = SchemaFactory.createForClass(Routine);
