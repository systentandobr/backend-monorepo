import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DietParametersDocument = DietParameters & Document;

@Schema({ timestamps: true })
export class DietParameters {
  @Prop({ required: true })
  id: string;

  @Prop({ type: Object, required: true })
  protein_g_per_day_target: {
    min: number;
    max: number;
    note: string;
  };

  @Prop({ required: true })
  sodium_mg_per_day_max: number;

  @Prop({ type: Object, required: true })
  phosphorus_mg_per_day_target: {
    max: number;
    note: string;
  };

  @Prop({ type: Object, required: true })
  potassium_strategy: {
    restriction: string;
    techniques: string[];
    avoid_examples: string[];
  };

  @Prop({ required: true })
  fiber_g_per_day_target: number;

  @Prop()
  fluid_limit_ml_per_day: number | null;

  @Prop({ required: true })
  fluid_note: string;

  @Prop({ required: true })
  createdAt: string;

  @Prop({ required: true })
  updatedAt: string;
}

export const DietParametersSchema = SchemaFactory.createForClass(DietParameters); 