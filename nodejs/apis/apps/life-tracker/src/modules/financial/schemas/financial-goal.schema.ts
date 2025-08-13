import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FinancialGoalDocument = FinancialGoal & Document;

@Schema({ timestamps: true })
export class FinancialGoal {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  target: number;

  @Prop({ required: true })
  current: number;

  @Prop({ required: true })
  deadline: string;

  @Prop()
  description?: string;

  @Prop()
  category?: string;

  @Prop({ required: true })
  createdAt: string;

  @Prop({ required: true })
  updatedAt: string;
}

export const FinancialGoalSchema = SchemaFactory.createForClass(FinancialGoal); 