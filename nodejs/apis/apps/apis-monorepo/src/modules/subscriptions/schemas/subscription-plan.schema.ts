import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SubscriptionPlanDocument = SubscriptionPlan & Document & {
  createdAt?: Date;
  updatedAt?: Date;
};

@Schema({
  timestamps: true,
  collection: 'subscription_plans',
})
export class SubscriptionPlan {
  _id?: Types.ObjectId;
  id?: string;

  @Prop({ required: true, index: true })
  unitId: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ type: Number, required: true })
  price: number; // em centavos

  @Prop({ type: Number, required: true })
  duration: number; // em dias

  @Prop({ type: [String], default: [] })
  features: string[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const SubscriptionPlanSchema = SchemaFactory.createForClass(SubscriptionPlan);

// Índices para performance
SubscriptionPlanSchema.index({ unitId: 1, isActive: 1 });
SubscriptionPlanSchema.index({ unitId: 1, createdAt: -1 });
