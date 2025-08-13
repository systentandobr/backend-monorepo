import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductivityGoalDocument = ProductivityGoal & Document;

@Schema({ timestamps: true })
export class ProductivityGoal {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  target: string;

  @Prop({ required: true })
  progress: number;

  @Prop({ required: true })
  deadline: string;

  @Prop()
  category?: string;

  @Prop()
  priority?: number;

  @Prop({ required: true })
  createdAt: string;

  @Prop({ required: true })
  updatedAt: string;
}

export const ProductivityGoalSchema = SchemaFactory.createForClass(ProductivityGoal); 