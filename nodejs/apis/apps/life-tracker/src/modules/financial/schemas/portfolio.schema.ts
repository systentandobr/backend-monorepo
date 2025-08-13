import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PortfolioDocument = Portfolio & Document;

@Schema({ timestamps: true })
export class Portfolio {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  total_value: number;

  @Prop({ required: true })
  total_return: number;

  @Prop({ type: Array, required: true })
  assets: Array<{
    id: string;
    name: string;
    value: number;
    return: number;
    allocation: number;
  }>;

  @Prop({ required: true })
  createdAt: string;

  @Prop({ required: true })
  updatedAt: string;
}

export const PortfolioSchema = SchemaFactory.createForClass(Portfolio); 