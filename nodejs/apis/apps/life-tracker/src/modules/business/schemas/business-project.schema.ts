import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BusinessProjectDocument = BusinessProject & Document;

@Schema({ timestamps: true })
export class BusinessProject {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  status: string;

  @Prop({ required: true })
  progress: number;

  @Prop({ required: true })
  deadline: string;

  @Prop()
  description?: string;

  @Prop()
  budget?: number;

  @Prop()
  team_size?: number;

  @Prop({ required: true })
  createdAt: string;

  @Prop({ required: true })
  updatedAt: string;
}

export const BusinessProjectSchema =
  SchemaFactory.createForClass(BusinessProject);
