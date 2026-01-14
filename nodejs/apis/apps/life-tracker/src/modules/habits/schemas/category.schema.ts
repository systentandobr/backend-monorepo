import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true })
  id: number;

  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop()
  icon?: string;

  @Prop()
  color?: string;

  @Prop({ type: [String], default: [] })
  habits: string[];

  @Prop({ required: true })
  createdAt: string;

  @Prop({ required: true })
  updatedAt: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
