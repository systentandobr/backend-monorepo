import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BusinessOpportunityDocument = BusinessOpportunity & Document;

@Schema({ timestamps: true })
export class BusinessOpportunity {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  investment: number;

  @Prop({ required: true })
  potential_return: number;

  @Prop({ required: true })
  risk: string;

  @Prop({ required: true })
  timeline: string;

  @Prop()
  category?: string;

  @Prop()
  status?: string;

  @Prop({ required: true })
  createdAt: string;

  @Prop({ required: true })
  updatedAt: string;
}

export const BusinessOpportunitySchema =
  SchemaFactory.createForClass(BusinessOpportunity);
