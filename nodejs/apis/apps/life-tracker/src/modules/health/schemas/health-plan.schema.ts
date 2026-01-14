import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type HealthPlanDocument = HealthPlan & Document;

@Schema({ timestamps: true })
export class HealthPlan {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ type: Object })
  meal_plan_week?: {
    days: string[];
    meals: string[];
    plan: {
      [day: string]: {
        [meal: string]: string;
      };
    };
  };

  @Prop({ type: Array })
  routines?: Array<{
    time: string;
    activity: string;
    domain?: string;
  }>;

  @Prop({ type: Array })
  notes_for_doctor_review?: string[];

  @Prop({ required: true })
  createdAt: string;

  @Prop({ required: true })
  updatedAt: string;
}

export const HealthPlanSchema = SchemaFactory.createForClass(HealthPlan);
