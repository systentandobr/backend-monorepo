import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PortfolioDocument = Portfolio & Document;

@Schema({ timestamps: true })
export class Portfolio {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, default: 0 })
  totalValue: number;

  @Prop({ required: true, default: 0 })
  totalInvested: number;

  @Prop({ type: [{
    id: String,
    symbol: String,
    name: String,
    quantity: Number,
    averagePrice: Number,
    currentPrice: Number,
    lastUpdated: Date,
  }], default: [] })
  assets: Array<{
    id: string;
    symbol: string;
    name: string;
    quantity: number;
    averagePrice: number;
    currentPrice: number;
    lastUpdated: Date;
  }>;

  @Prop({ required: true, default: Date.now })
  lastUpdated: Date;
}

export const PortfolioSchema = SchemaFactory.createForClass(Portfolio); 