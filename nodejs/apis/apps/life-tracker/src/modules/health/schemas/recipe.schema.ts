import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RecipeDocument = Recipe & Document;

@Schema({ timestamps: true })
export class Recipe {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  servings: number;

  @Prop({ type: Array, required: true })
  ingredients: Array<{
    item: string;
    qty: string;
  }>;

  @Prop({ type: Array, required: true })
  steps: string[];

  @Prop({ required: true })
  renal_tip: string;

  @Prop()
  category?: string;

  @Prop()
  prep_time?: string;

  @Prop()
  cook_time?: string;

  @Prop({ required: true })
  createdAt: string;

  @Prop({ required: true })
  updatedAt: string;
}

export const RecipeSchema = SchemaFactory.createForClass(Recipe);
