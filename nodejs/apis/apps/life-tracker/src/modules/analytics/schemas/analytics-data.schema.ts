import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AnalyticsDataDocument = AnalyticsData & Document;

@Schema({ timestamps: true })
export class AnalyticsData {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  event_type: string;

  @Prop({ type: Object, required: true })
  event_data: {
    [key: string]: any;
  };

  @Prop({ required: true })
  timestamp: string;

  @Prop()
  user_id?: string;

  @Prop()
  session_id?: string;

  @Prop()
  domain?: string;

  @Prop({ required: true })
  createdAt: string;

  @Prop({ required: true })
  updatedAt: string;
}

export const AnalyticsDataSchema = SchemaFactory.createForClass(AnalyticsData);
