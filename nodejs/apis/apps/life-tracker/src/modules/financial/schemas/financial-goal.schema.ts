import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FinancialGoalDocument = FinancialGoal & Document;

@Schema({ timestamps: true })
export class FinancialGoal {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  target: number;

  @Prop({ required: true, default: 0 })
  current: number;

  @Prop({ required: true })
  deadline: string;

  @Prop({ required: true, default: 'medium' })
  priority: string;

  @Prop()
  description?: string;

  @Prop()
  category?: string;
}

export const FinancialGoalSchema = SchemaFactory.createForClass(FinancialGoal); 